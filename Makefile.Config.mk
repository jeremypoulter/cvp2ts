# DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER
#  
# Copyright (C) 2014, Cable Television Laboratories, Inc. & Skynav, Inc. 
#  
# Redistribution and use in source and binary forms, with or without modification, are
# permitted provided that the following conditions are met:
#
# * Redistributions of source code must retain the above copyright notice, this list
#   of conditions and the following disclaimer.
# * Redistributions in binary form must reproduce the above copyright notice, this list
#   of conditions and the following disclaimer in the documentation and/or other
#   materials provided with the distribution.
#
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
# "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
# TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
# PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
# HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
# SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
# LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
# DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
# THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
# (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
# THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

# Helpers for debugging the Node.js utils
NODE_DEBUG = --inspect=9222 --debug-brk

# Comment out to show make commands
V=@

# commands
CP		= cp
ECHO		= echo
NODE		= node
PYTHON		= python

# tool flags
TOOLFLAGS	= -v
FETCHFLAGS	=
EXTRACTFLAGS	=
PARSEFLAGS	=
GENERATEFLAGS	=
CLEANFLAGS	=

# common tools directory
COMMONDIR	= $(TOP)/tools/common

# specifications directory
SPECDIR		= $(TOP)/specs

# tests directory
TESTDIR		= $(TOP)/tests

# configuration file name
CONFIG    	= config.json
CONFIGSUFFIX	= $(CONFIG)

# tool macros
GETOPTION	= $(NODE) $(COMMONDIR)/getoption.js
CLEANTOOL	= $(NODE) $(COMMONDIR)/clean.js $(TOOLFLAGS) $(CLEANFLAGS)

include $(TOP)/Makefile.Specs.mk
include $(TOP)/Makefile.Tools.mk
