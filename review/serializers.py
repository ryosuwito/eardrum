import re
import json
import logging

from django.contrib.auth import get_user_model
from django.utils import six

from rest_framework import serializers
from rest_framework.validators import ValidationError
from rest_framework.utils import html
from markdownx import utils

from .models import (
    Question,
    Bucket,
    Request,
)

from config.models import Entry
from config import utils as config_utils

Logger = logging.getLogger(__name__)


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'

    html_content = serializers.SerializerMethodField()

    def get_html_content(self, obj):
        return utils.markdownify(obj.content)


class BucketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bucket
        fields = '__all__'

    questions = QuestionSerializer(many=True, read_only=True)
    extra = serializers.SerializerMethodField()
    ordered_questions = serializers.SerializerMethodField()

    def get_ordered_questions(self, obj):
        try:
            ordering = list(map(lambda x: int(x), obj.ordering.split(',')))
        except Exception as err:
            Logger.warning(err)
            ordering = []

        ordered_questions = []
        questions = obj.questions.all()
        for q_id in ordering:
            for question in questions:
                if question.id == q_id:
                    ordered_questions.append(QuestionSerializer(question).data)
                    break

        return ordered_questions

    def get_extra(self, obj):
        try:
            extra = {el[0]: float(el[1]) for el in map(lambda x: x.split(':'), obj.extra.split(';'))}
        except:
            return None
        else:
            return extra


class JSONField(serializers.Field):
    default_error_messages = {
        'invalid': 'Value must be valid dictionary.'
    }

    def __init__(self, *args, **kwargs):
        self.binary = kwargs.pop('binary', False)
        super(JSONField, self).__init__(*args, **kwargs)

    def get_value(self, dictionary):
        if html.is_html_input(dictionary) and self.field_name in dictionary:
            # When HTML form input is used, mark up the input
            # as being a JSON string, rather than a JSON primitive.
            class JSONString(six.text_type):
                def __new__(self, value):
                    ret = six.text_type.__new__(self, value)
                    ret.is_json_string = True
                    return ret
            return JSONString(dictionary[self.field_name])
        return dictionary.get(self.field_name, serializers.empty)

    def to_internal_value(self, data):
        try:
            if self.binary or getattr(data, 'is_json_string', False):
                if isinstance(data, six.binary_type):
                    data = data.decode('utf-8')
                return json.loads(data)
            elif type(data) is not dict:
                raise ValueError()
        except (TypeError, ValueError):
            self.fail('invalid')
        return data

    def to_representation(self, value):
        if self.binary:
            value = json.dumps(value)
            # On python 2.x the return type for json.dumps() is underspecified.
            # On python 3.x json.dumps() returns unicode strings.
            if isinstance(value, six.text_type):
                value = bytes(value.encode('utf-8'))
        return json.loads(value)


class RequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Request
        all_fields = {field.name for field in Request._meta.fields}
        fields = '__all__'
        read_only_fields = list(all_fields - {'review'})

    issuer = serializers.SlugRelatedField(slug_field='username', read_only=True)
    reviewer = serializers.SlugRelatedField(slug_field='username', read_only=True)
    reviewee = serializers.SlugRelatedField(slug_field='username', read_only=True)
    bucket = BucketSerializer(read_only=True)

    status = serializers.SerializerMethodField()
    summary = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()
    close_at = serializers.SerializerMethodField()
    review = JSONField()

    def get_progress(self, obj):
        try:
            question_set = {str(question.id) for question in obj.bucket.questions.all()}
            review_set = {str(key) for key in json.loads(obj.review).keys()}
        except Exception as err:
            Logger(err)
            return '-1/%s' % (len(question_set))
        else:
            return "%s/%s" % (len(question_set & review_set), len(question_set))

    def get_status(self, obj):
        if obj.is_request_valid_to_update():
            return 'Open'
        
        return 'Closed'

    def get_close_at(self, obj):
        return obj.get_close_at()

    def get_summary(self, obj):
        try:
            coefficients = obj.bucket.extra

            questions = obj.bucket.questions.all()
            reviews = json.loads(obj.review)

            grade_options = config_utils.get_grade_options(Entry.objects.get(name='grade_options').value)
            grade_map = {grade['name']: grade['value'] for grade in grade_options}
        except Exception as err:
            Logger.warn(err)
            return "-1/100"

        points = 0
        for question_id, ans in reviews.items():
            try:
                if type(coefficients) is not dict:
                    coef = 100.0/len(questions)
                else:
                    coef = coefficients[question_id]
                points += coef * int(grade_map[ans.get('grade', 'F')])
            except Exception as err:
                Logger.warn(err)

        return "%s/100" % round(points/100, 2)
    
    def validate(self, attrs):
        if attrs.get('review'):
            attrs['review'] = json.dumps(attrs['review'])
        
        return attrs
