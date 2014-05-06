TOP		= .

include $(TOP)/Makefile.Config.mk

SUBDIRS		= tools

all clean: subdirs

subdirs: $(SUBDIRS)

$(SUBDIRS):
	@$(MAKE) -C $@ $(MAKECMDGOALS)

.PHONY: all clean subdirs $(SUBDIRS)

