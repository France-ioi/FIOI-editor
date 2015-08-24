# FIOI_editor

Stateful PHP editor based on CodeMirror, to be used in PEM tasks.

## Installation

Install the javascript part through bower:

    bower install France-ioi/fioi-editor

and the php part (optionally) with composer through a `composer.json` like:

    {
       "repositories": [{
          "type": "vcs",
          "url": "http://github.com/France-ioi/fioi-editor"
       }],
       "require": {
          "namshi/jose": "*",
          "France-ioi/fioi-editor": "*@dev"
       }
    }

See the demo for a simple use case.

## Trying the demo

You must have a database set up with the `tm\_platform`, `tm\_source\_codes` and `tm\_tasks\_tests` tables (see the requests for relevant fields). Then add a `connect.php` at the root of the repository providing a `$db` variable in the global scope. Then you can visit

    demo.html?sPlatform=xxx

where `xxx` is the platform name.

## Updating the min files

Install dependencies:

    npm install

and generate the files:

   gulp compile


## TODO

The code has been made by someone using as many bad practices as he could, everything should be recoded from scratch.
