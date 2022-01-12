from django import forms
from django.contrib.admin import widgets


class BatchRequestForm(forms.Form):
    close_at = forms.DateTimeField()
    quarter_and_year = forms.CharField(
        max_length=10, widget=forms.TextInput(attrs={'placeholder': 'Format "Q,YYYY"'}))

    class Media:
        css = {
            'all': ['/static/admin/css/widgets.css', ]
        }

    def __init__(self, *args, **kwargs):
        super(BatchRequestForm, self).__init__(*args, **kwargs)
        self.fields['close_at'].required = True
        self.fields['close_at'].widget = widgets.AdminSplitDateTime()
        self.fields['quarter_and_year'].required = True
