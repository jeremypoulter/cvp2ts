<!--
// DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER
//  
// Copyright (C) 2014, Cable Television Laboratories, Inc. & Skynav, Inc. 
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
  README.ms             - this readme
  specs/                - contains one sub-directory for each specification
  tests/                - contains test (and helper and resource) files produced by build
  tools/                - contains build, utility,and run tools
</pre>

Each specification directory is initially populated with a configuration file, e.g.,
`html5.config.json`, which provides configuration parameters for the build tool chain.

## Build Tool Chain

The following tools are executed in the normal build chain:

<pre>
  fetch                 - fetches specification source, unless skipped (see below)
  extract               - extracts WebIDL fragments from specification source unless skipped (see below)
  parse                 - parses WebIDL fragments into JSON representation
  index                 - aggregates all parsed WebIDL into an index, used in subsequent steps
  generate              - generates tests from parsed WebIDL fragments
</pre>

Fetching a specification may be skipped by its configuration file for various reasons, such as listed below. If not skipped by configuration parameter, an attempt is made to fetch in order to determine the Last-Modified date and time. If a cached version is available and the specification has not changed, then the remainder of the fetch is skipped.

Some reasons for skipping fetch include:

 * Specification is final (REC or equivalent)
 * Specification must be manually processed after fetching before performing extraction, e.g., in order to create a `respec` snapshot.
 * WebIDL must be manually extracted or edited, in which case refetch should be performed manually before this extraction or edit.

Extracting WebIDL from a fetched specification may be skipped according to configuration control if the IDL cannot be automatically extracted or must be manually edited, e.g., to make it acceptable to the WebIDL parser.

## Building Tests

In order to perform a clean build, perform the following steps:

<pre>
  % make clean
  % make
  % make MANIFEST.json
</pre>

Normally rebuilding the `MANIFEST.json` file is not required unless some test has changed (or been added or removed).

## Build and Run Dependencies

 * node.js
 * npm
 * cheerio npm module
 * webidl2 npm module
 * python

## Running Tests

In order to run tests, perform the following steps:

 1. Add entries to the local /etc/hosts file as follows:
    `127.0.0.1 web-platform.test`
    `127.0.0.1 www.web-platform.test`
 2. From the top-level directory of this `cvp2ts` hierarchy, run the following command in a separate shell:
    `python tools/w3c/scripts/serve.py`
 3. From the test browser (user agent), open the following link:
    `http://web-platform.test:8000/tools/w3c/runner/index.html`
 4. After setting runner options as desired, click on `Start` button. Note that Manual tests are enabled by default, and there is at least one manual test present in the generated tests.

If it is desired that the server and client run on separated devices, then the nameserver in use should be configured to return the desired address for the server (instead of the localhost address).

## Notes

 * At present, `cvp2ts` is being developed using the following versions of tools:

<pre>
    $ node --version
    v0.10.26

    $ npm --version
    1.4.3

    $ npm ls --parseable true --long true cheerio | awk -F: '{print $2}'
    cheerio@0.17.0

    $ npm ls --parseable true --long true webidl2 | awk -F: '{print $2}'
    webidl2@2.0.6

    $ python -V
    Python 2.7.7
</pre>

## Issues

See [Open Issues](http://github.com/skynav/cvp2ts/issues?state=open) for current known bugs, feature requests (enhancements), etc.
