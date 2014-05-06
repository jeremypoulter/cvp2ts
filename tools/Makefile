TOP		= ..

include $(TOP)/Makefile.Config.mk

SUBDIRS		= level1

all clean: subdirs

subdirs: $(SUBDIRS)

$(SUBDIRS):
	@$(MAKE) -C $@ $(MAKECMDGOALS)

.PHONY: all clean subdirs $(SUBDIRS)

