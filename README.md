<!--
// DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER
//  
// Copyright (C) 2014, Skynav, Inc. & Cable Television Laboratories, Inc.
//  
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// * Redistributions of source code must retain the above copyright notice, this list
//   of conditions and the following disclaimer.
// * Redistributions in binary form must reproduce the above copyright notice, this list
//   of conditions and the following disclaimer in the documentation and/or other
//   materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
// TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
// PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
// THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
-->

cvp2ts
======

Commercial Video Player 2 Test Suite

The `cvp2ts` tool provides a test suite for performing signature and feature presence testing on a candidate Commercial Video Player 2 (CVP2) user agent (browser).

## Organization

The `cvp2ts` tool source and build tree is organized as follow:

<pre>
  Makefile              - top level (GNU) makefile
  Makefile.Config.mk    - general make configuration parameters
  Makefile.Specs.mk     - specifications parameter (determines which specifications to process)
  Makefile.Tools.mk     - tools parameter (determines which tools are run)
  README.md             - this readme
  specs/                - contains one sub-directory for each specification
  specs/index           - special (pseudo) specification directory where aggregate parsed IDL index is written
  tests/                - contains test (and helper and resource) files produced by build
  tools/                - contains build, utility, and run tools
</pre>

Each specification directory is initially populated with a configuration file, e.g.,
`html5.config.json`, which provides configuration parameters for the build tool chain.

## Build Tool Chain

The following tools are executed in the normal build chain. Different levels may vary in tool usage.

<pre>
  fetch                 - fetches specification source, unless skipped (see below)
  extract               - extracts WebIDL fragments from specification source unless skipped (see below)
  parse                 - parses WebIDL fragments into JSON representation
  index                 - aggregates all parsed WebIDL into an index, used in subsequent steps
  generate              - generates tests from parsed WebIDL fragments
</pre>

Fetching a specification may be skipped by its configuration file for various reasons, such as listed below. If not skipped by configuration parameter, an attempt is made to fetch in order to determine the Last-Modified date and time. If a cached version is available and the specification has not changed, then the remainder of the fetch is skipped.

Some reasons for skipping fetch include:

 * Specification is final (REC or equivalent).
 * Specification must be manually processed after fetching before performing extraction, e.g., in order to create a `respec` snapshot.
 * WebIDL must be manually extracted or edited, in which case refetch should be performed manually before manual extraction or edit.

Extracting WebIDL from a fetched specification may be skipped according to configuration control if the IDL cannot be automatically extracted or must be manually edited, e.g., to make it acceptable to the WebIDL parser.

## Building Tests

In order to perform a clean build, perform the following steps:

```
npm install
make clean
make
make MANIFEST.json
```

Normally rebuilding the `MANIFEST.json` file is not required unless some test has changed (or been added or removed). Note that rebuilding `MANIFEST.json` requires a committed git repository (if one is being used).

## Build and Run Dependencies

 * node.js
 * npm
 * cheerio npm module
 * webidl2 npm module
 * python

## Running Tests

In order to run tests, perform the following steps:

 1. Add entries to the local /etc/hosts file as follows:
    * `127.0.0.1 web-platform.test`
    * `127.0.0.1 www.web-platform.test`
    * `127.0.0.1 www1.web-platform.test`
 2. From the top-level directory of this `cvp2ts` hierarchy, run the following command in a separate shell:
    * `python tools/w3c/scripts/serve.py`
 3. From the test browser (user agent), open the following link:
    * `http://web-platform.test:8000/tools/w3c/runner/index.html`
 4. After setting runner options as desired, click on `Start` button. Note that manual tests are enabled by default, and there is at least one manual test present in the generated tests.

If it is desired that the server and client run on separated devices, then the nameserver in use should be configured to return the desired address for the server (instead of the localhost address).

## Notes

 * At present, `cvp2ts` is being developed using the following versions of tools:

```
$ node --version
v7.1.0

$ npm --version
3.10.9

$ npm ls
cheerio@0.19.0

$ npm ls --parseable true --long true webidl2 | awk -F: '{print $2}'
cvp2ts@1.0.0 D:\Users\Jeremy\Documents\Dev\JeremyPoulter\cvp2ts
+-- cheerio@0.22.0
| +-- css-select@1.2.0
| | +-- boolbase@1.0.0
| | +-- css-what@2.1.0
| | +-- domutils@1.5.1
| | `-- nth-check@1.0.1
| +-- dom-serializer@0.1.0
| | `-- domelementtype@1.1.3
| +-- entities@1.1.1
| +-- htmlparser2@3.9.2
| | +-- domelementtype@1.3.0
| | +-- domhandler@2.3.0
| | +-- inherits@2.0.3
| | `-- readable-stream@2.2.2
| |   +-- buffer-shims@1.0.0
| |   +-- core-util-is@1.0.2
| |   +-- isarray@1.0.0
| |   +-- process-nextick-args@1.0.7
| |   +-- string_decoder@0.10.31
| |   `-- util-deprecate@1.0.2
| +-- lodash.assignin@4.2.0
| +-- lodash.bind@4.2.1
| +-- lodash.defaults@4.2.0
| +-- lodash.filter@4.6.0
| +-- lodash.flatten@4.4.0
| +-- lodash.foreach@4.5.0
| +-- lodash.map@4.6.0
| +-- lodash.merge@4.6.0
| +-- lodash.pick@4.4.0
| +-- lodash.reduce@4.6.0
| +-- lodash.reject@4.6.0
| `-- lodash.some@4.6.0
+-- lodash@3.10.1
`-- webidl2@2.0.11

$ python -V
Python 3.5.2
```

## Issues

See [Open Issues](http://github.com/skynav/cvp2ts/issues?state=open) for current known bugs, feature requests (enhancements), etc.
