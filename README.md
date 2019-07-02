# eardrum

## User Document

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

## Development

#### Server
  * ```pip install -r requirements```: Install modules (should use virtual environment).
  * ```cp -r localconfigs.example localconfigs```: Copy configs and change it if needed.
  * ```python manage.py runserver 0.0.0.0:8000```: Run server at ```0.0.0.0:8000```.

#### Client
  * ```cd frontend```: cd to client app.
  * ```npm install```: Instal packages.
  * ```cp -r src/configs.template src/configs```: Copy frontend configs and change it if needed.
  * ```npm run watch```: Watch for code changes, frontend will be updated whenever the code is changed.

## Deployment
  * Adjust these configs bellow by following templates.
    *  ```./localconfigs```.
    *  ```./frontend/src/configs```.
    *  ```./deployment/environ/deployment.env```.
  * ```docker-compose up --build```: Using docker-compose to deploy.