
#  User guideline
This project contains 5 different apps: Performance App, OKR App, Compliance App, Main App and Leave App.
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


## Leave App
This app allow users to submit and organize application for leave.

#### Use cases
  * Normal users can:
    * Manage their leave applications: 
      * Create and submit applications
      * Cancel (delete) their pending applications
      * View all of their applications (either pending, approved or rejected)
    * View statistics of their leave days
    * View a list of users on leave on a particular day, separated into groups
    * View holidays of a particular year
  * Admin users can:
    * Perform any action normal users can, without user restriction (i.e. can manage leave applications of anyone)
    * Approve or reject any pending application
    * Edit holidays

#### Configuration
  * To edit leave types: edit entries in the Config entries object `leaves_type_<year>` 

## Main App
To be completed

