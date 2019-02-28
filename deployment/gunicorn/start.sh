# Frontend
cd /usr/src/app/frontend
npm install
npm run build

# Install packages
cd /usr/src/app
pip3 install -U pip
pip install -U setuptools
pip install -r requirements.txt

# Runserver
python3 manage.py collectstatic --noinput
python3 manage.py migrate 
mkdir -p run
gunicorn -c deployment/gunicorn/gunicorn.py eardrum.wsgi:application
