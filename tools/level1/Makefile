TOP		= ../..

include $(TOP)/Makefile.Config.mk

#SUBDIRS		= fetch extract parse
SUBDIRS		= generate

all clean: subdirs

subdirs: $(SUBDIRS)

$(SUBDIRS):
	@$(MAKE) -C $@ $(MAKECMDGOALS)

extract: fetch

parse: extract

generate: parse

.PHONY: all clean subdirs $(SUBDIRS)

