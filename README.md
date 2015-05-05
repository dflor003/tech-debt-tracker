# Tech Debt Tracker
Tool to track and visualize Technical Debt with the aim of answering the age-old question of "What's slowing you down?" on a project.

# Setup
To install all local/global dependencies:

```bash
npm install
```
    
Once that succeeds, run the following command to compile all client-side and server-side TypeScript files:

```bash
jake compile
```
    
To seed the database with test data, first make sure you have MongoDB 2.6 or higher installed locally and then run:

```bash
jake seed
```
    
To start running the application, run:

```bash
npm start
```
    