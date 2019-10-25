# Salubrity

This app was built using the 'create-react-app' boilerplate. Heroku is the preferred host and MongoDB is the database I used, whose hosting is also provided by Heroku.

You will first need to set up an account with Heroku and then have Cory add you as a collaborator. You will want to also download the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) in order to use the command line for interacting with Heroku.

## Setup Project Locally
1. Clone this repository
2. Navigate to project root
3. `npm install`

## Run App Locally for Development
1. `npm start`

## Building the application
1. Navigate to project root 
2. `cd client`
3. `npm run build`
4. `cd ..`
5. `git add .`
6. `git commit -m "commit message"`
7. `git push`
8. `git push heroku master`

## Database Seeding and Structure
I use the `seed-data.js` file for defining the database structure for all Mongo documents.
1. The `Call` table holds all procedures or 'calls' 
2. The `User` document holds all user data 
3. The `Procedure` document handles the structure of a procedure and it's inner groups and options
4. The `Item` document handles all the individual items that are selectable in a procedure
5. The `Option` document handles any additional option objects that might not be directly tied to a procedure item and for relational data, if necessary. For example, hospitals are stored as numbers in the `User` document. Every selectable hospital is defined in the `Option` document, both it's name and the correlating number, thus, you will need to use the `Option` document when trying to cross-reference values and their corresponding names. Also the `MD Order Change` and `Call Needs` dropdown are defined here. These fields can be updated in admin.