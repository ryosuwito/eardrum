from django.http import HttpResponse
from django.template.loader import get_template

from io import BytesIO
from xhtml2pdf import pisa

from .serializers import BucketSerializer
import json


def render_to_pdf(template_src, context_dict={}):
    template = get_template(template_src)
    html = template.render(context_dict)
    result = BytesIO()
    pdf = pisa.pisaDocument(BytesIO(html.encode("UTF-8")), result)
    if not pdf.err:
        return HttpResponse(result.getvalue(), content_type='application/pdf')
    return None


def get_pdf_response(request, template_name, filename, context={}):
    pdf = render_to_pdf(template_name, context)
    response = HttpResponse(pdf, content_type='application/pdf')
    content = "inline; filename=%s.pdf" % (filename)
    download = request.GET.get("download")
    if download:
        content = "attachment; filename=%s.pdf" % (filename)
    response['Content-Disposition'] = content
    return response


def generate_context(request_object):
    reviews = json.loads(request_object.review)
    bucket = BucketSerializer(data=request_object.bucket)
    bucket_extra = bucket.get_extra(request_object.bucket)
    ordered_questions = bucket.get_ordered_questions(request_object.bucket)
    ordered_review = []
    quarter = request_object.quarter_and_year.split(",")
    for question in ordered_questions:
        ordered_review.append(
            {
                "point": bucket_extra[str(question["id"])],
                "review": reviews[str(question["id"])] if str(question["id"]) in reviews else [],
                "question": question
            }
        )
    if ordered_review:
        return {
            "request": {
                "title": "{}_{}Q{}".format(request_object.reviewee.username, quarter[1], quarter[0]),
                "reviewee": request_object.reviewee.get_short_name(),
                "reviewer": request_object.reviewer.get_short_name(),
                "quarter_and_year": request_object.quarter_and_year,
                "ordered_review": ordered_review,
            }
        }
    return None
