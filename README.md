# Verbkit - toolkit for simplifying the development of 2D video games

Verbkit is a toolkit project designed to lift much the burden of making 2D games; it is primarily intended for novice game developers - developers whom have no idea of where to start or knowledge of individual concepts of game development.

Begin by installing Verbkit using npm:

```
npm install -g verbkit
verbkit initialize
```

#Creating a project with Verbkit

Verbkit provides command line tools to create, build and run your projects. The "create" command
will create your project at a specified location. If no location is given, it will generate a project
on your desktop.

```
verbkit create "projectName" "location"
```
Where "projectName" is the name of your project, without quotes, and "location" is the location you'd like
When you've created your project, cd into your project folder and run:

```
verbkit run
```

Or if your project is on your desktop:

```
verbkit run "projectName"
```

This will build the js file that contains your game and open a browser window up for the game to be played. However, this is not an interesting game. Head to the documentation page for all of the API features available to you: http://everette00.github.io/verbkit/

Please Note: Verbkit is not complete and development has halted for the project. Please feel free to pull the project and continue if you'd like.
