TOP		= ../../..

include $(TOP)/Makefile.Config.mk

TOOL		= fetch.js
outfiles	:= $(foreach spec, $(SPECS), $(SPECDIR)/$(spec)/.cache/$(spec).html)

all: $(outfiles)

%.html: FORCE
	@$(NODE) $(TOOL) $(TOOLFLAGS) $(FETCHFLAGS) --config $(dir $(@D))$(CONFIG) $@.ts $@

FORCE:

clean:
	@$(RM) $(outfiles) $(patsubst %.html, %.html.ts, $(outfiles))

.PHONY: all clean

