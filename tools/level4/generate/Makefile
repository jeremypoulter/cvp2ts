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

TOP		= ../../..

include $(TOP)/Makefile.Config.mk

TOOL		= generate.js
OUTSUFFIX	= test.ts
outfiles	:= $(foreach spec, $(SPECS_L4), $(SPECDIR)/$(spec)/$(spec).$(OUTSUFFIX))

all: $(outfiles)

%.$(OUTSUFFIX): %.$(CONFIGSUFFIX)
	@if [ ! -d $(TESTDIR)/$(*F) ]; then mkdir -p $(TESTDIR)/$(*F); fi;
	$(V)$(NODE) $(TOOL) $(TOOLFLAGS) $(GENERATEFLAGS) --config $(@D)/$(*F).$(CONFIGSUFFIX) --testDirectory $(TESTDIR)/$(*F)
	@if [ -d $(SPECDIR)/$(*F)/helpers ]; then \
	    $(CP) -R $(SPECDIR)/$(*F)/helpers $(TESTDIR)/$(*F) ; \
	fi;
	@if [ -d $(SPECDIR)/$(*F)/resources ]; then \
	    $(CP) -R $(SPECDIR)/$(*F)/resources $(TESTDIR)/$(*F) ; \
	fi;

clean:
	@$(CLEANTOOL) --phase generate --testDirectoryRoot $(TESTDIR) $(outfiles)

.PHONY: all clean
