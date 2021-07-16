
#  User guideline
This project contains 4 different apps: Performance App, OKR App, Compliance App, Main App.
##  Performance App
This app allows a user can give a review to another user.

#### Concepts
  * A __Request__ will contain a reviewer, a reviewee, a specific list of question and a point of time when the request will be closed (could be empty). The reviewer will give the review to the reviewee by complete all the questions in the list. The request will be closed automatically after the defined point of time or 3 days after the request created by default.
  * A __Bucket__ is a list of relevant questions for reviewing.
  * A __Reviewer__ can see all the request where they are the reviewer.
  * An __Editor__ is a user who can create and edit questions and buckets.
  * An __Administrator__ is a user who has all the permissions.
#### Actions
  * Reviewer
    *  Can review a reviewee as a request defined by giving the answer to all questions in the list
    *  Can see all requests where they are the reviewer.
  * Administrator
    *  Can see all requests.
    *  Can create a request.
  * Editor
    * Can see and edit all questions and buckets.

#### Reviewing system
  Each question in a bucket has a specified score.
  * Grade: A question can be graded A, B, C, D or F correspond to 1, 0.75, 0.5, 0.25 or 0. It could be with + or - to indicate that the question is graded more or less than an amount of 0.05 to the original point of grade (i.e: A+ is 1.05 while A- is 0.95). The score of a question in a request is the product by multiplying its own score by grade.
  * Comment: Reviewer can give a comment to a question besides the grade.


##  OKR App

This app is created for managing OKR.

##  Compliance App
This app allows users to create compliance forms.

#### Overview
There're 4 types of form:
* Form A: Brokerage Account Disclosure.
* Form B: Employee Securities Holdings Report.
* Form C: Employee Quarterly Trade Report.
* Form D: Request for Pre-Clearance of Securities Trade (need admin's approval).

#### Actions
  * Normal User
    *  Can edit/delete their own form.
    *  Can create a new form.
    *  Can see all forms they created.
  * Administrator
    *  Can see all forms.
    *  Can edit/delete all forms.
    *  Can create a new form.
    *  Can Approve/Reject user's form D (once form D is approved/rejected, it can't be edited/deleted).

#  Technical document

##  Deployment

###  How to deploy
Not written yet.

###  Status
Not written yet.
##  Development

###  How to start developing

####  Server

*  ```pip install -r requirements```: Install modules (should use virtual environment).

*  ```cp -r localconfigs.example localconfigs```: Copy configs (change it if needed).
*  Modify eardrum/settings.py:
    * Comment out lines which contain ldap_backend or LDAP_SERVER.
    *  Change Static folders: ```os.path.join(BASE_DIR, 'frontend', 'build', 'static')``` to ```os.path.join(BASE_DIR, 'frontend', 'dist', 'static')```.
    *  Change Webpack stats file: ```'STATS_FILE': os.path.join(BASE_DIR, 'frontend', 'webpack-stats-prod.json')``` to ```'STATS_FILE': os.path.join(BASE_DIR, 'frontend', 'webpack-stats.json')```.

*  ```python manage.py runserver 0.0.0.0:8000```: Run server at ```0.0.0.0:8000```.

####  Client

*  ```cd frontend```: cd to client app.

*  ```npm install```: Instal packages.

*  ```npm run watch```: Watch for code changes, frontend will be updated whenever the code is changed (need to refresh the website to see the changes).

###  Test
Not written yet.

###  CI/CD
Not written yet.

##  Architecture

Each app in the project is contained in a separate folder (apply for both backend and frontend). Apps have nothing to do with each other.

###  Backend

Using Django Rest Framework ver 3.9.1

###  Frontend

Using React.js ver 16.8.5

###  Performance App
This app follows common architecture: API is built with Django Rest Framework, Client side then calls the APIs to get the data and renders the website. There's no special thing about this app.

###  OKR App
This app follows common architecture: API is built with Django Rest Framework, Client side then calls the APIs to get the data and renders the website. There's no special thing about this app.

###  Compliance App
This app follows common architecture: API is built with Django Rest Framework, Client side then calls the APIs to get the data and renders the website. There's no special thing about this app.

###  Main App

Main app contains apps which are too small to be created as a new app. Currently, this app only contains User guideline app which is an app for displaying user guideline.

In User guideline app, markdown content is saved in the database instead of hard coding in the react component for better flexibility. Admin can go to admin page and update the content if it's necessary without having to update the react component.

### Leave App

Minimum backend configuration: executing `python manage.py leave_init <year>`
- Config entries object `holidays_<year>` is a list of holiday in that year with format "YYYYMMDD"
- Config entries object `leaves_type_<year>` contains information about different types of leaves

##  What's next?

* Writing test for all the applications in the project
* Fixing performance of Performance app in production environment.
