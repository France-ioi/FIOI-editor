# FIOI_editor

Stateful PHP editor based on CodeMirror, to be used in PEM tasks.

## Installation

Install it through composer and bower:

    bower install France-ioi/FIOI-editor
    composer install France-ioi/FIOI-editor

Then you can implement 

## Trying the demo

You must have a database set up with the `tm\_platform`, `tm\_source\_codes` and `tm\_tasks\_tests` tables (see the requests for relevant fields). Then add a `connect.php` at the root of the repository providing a `$db` variable in the global scope. Then you can visit

    demo.html?sPlatform=xxx

where `xxx` is the platform name.

## Updating the min files

Install dependencies:

    npm install

and generate the files:

   gulp compile
