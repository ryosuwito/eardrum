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
        point = 0
        review = []
        q_id = str(question["id"]) if "id" in question else "0"
        q_type = question["typ"] if "typ" in question else ""

        if bucket_extra and q_id in bucket_extra and q_type != "title":
            point = bucket_extra[q_id]
        if reviews and q_id in reviews:
            review = reviews[q_id]

        ordered_review.append(
            {
                "point": point,
                "review": review,
                "question": question
            }
        )
    if ordered_review:
        return {
            "request": {
                "title": "{}_{}_{}Q{}".format(request_object.reviewee.username,
                                              request_object.reviewer.username,
                                              quarter[1] if len(quarter) > 1 else '--',
                                              quarter[0] if len(quarter) > 0 else '--'),
                "reviewee": request_object.reviewee.username,
                "reviewer": request_object.reviewer.username,
                "quarter_and_year": request_object.quarter_and_year,
                "ordered_review": ordered_review,
            }
        }
    return None
