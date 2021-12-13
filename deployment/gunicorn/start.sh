# Runserver
python manage.py migrate 
# mkdir -p run
# gunicorn -c deployment/gunicorn/gunicorn.py eardrum.wsgi:application
python manage.py runserver 0.0.0.0:80
