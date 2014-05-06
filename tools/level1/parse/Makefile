TOP		= ../../..

include $(TOP)/Makefile.Config.mk

TOOL		= parse.js
outfiles	:= $(foreach spec, $(SPECS), $(SPECDIR)/$(spec)/.cache/$(spec).idl.json)

all: $(outfiles)

%.idl.json: %.idl
	@$(NODE) $(TOOL) $(TOOLFLAGS) $(GENERATEFLAGS) --config $(dir $(@D))$(CONFIG) $< $@

clean:
	@$(RM) $(outfiles)

.PHONY: all clean
