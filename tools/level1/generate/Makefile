TOP		= ../../..

include $(TOP)/Makefile.Config.mk

TOOL		= generate.js
outfiles	:= $(foreach spec, $(SPECS), $(SPECDIR)/$(spec)/.cache/$(spec).js)

all: $(outfiles)

%.js: %.idl.json
	@$(NODE) $(TOOL) $(TOOLFLAGS) $(GENERATEFLAGS) --config $(dir $(@D))$(CONFIG) $< $@

clean:
	@$(RM) $(outfiles)

.PHONY: all clean
