TOP		= ../../..

include $(TOP)/Makefile.Config.mk

TOOL		= extract.js
outfiles	:= $(foreach spec, $(SPECS), $(SPECDIR)/$(spec)/.cache/$(spec).idl)

all: $(outfiles)

%.idl: %.html
	@$(NODE) $(TOOL) $(TOOLFLAGS) $(EXTRACTFLAGS) --config $(dir $(@D))$(CONFIG) $< $@

clean:
	@$(RM) $(outfiles)

.PHONY: all clean
