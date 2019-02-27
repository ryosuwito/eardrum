# Install packages
cd /usr/src/app
python3 -m pip install -U pip
python3 -m venv env
source env/bin/activate
pip3 install -U setuptools
pip3 install -r requirements.txt
pip3 install gunicorn==19.9.0

# Runserver
python3 manage.py collectstatic --noinput
python3 manage.py migrate 
python3 manage.py runserver 0.0.0.0:8000