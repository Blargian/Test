---
alias: []
description: 'Documentation for the PrettyCompactNoEscapes format'
input_format: false
keywords: ['PrettyCompactNoEscapes']
output_format: true
slug: /interfaces/formats/PrettyCompactNoEscapes
title: 'PrettyCompactNoEscapes <Badge intent="success">Output</Badge>'
doc_type: 'reference'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

## Description [#description]

Differs from the [`PrettyCompact`](./PrettyCompact.md) format in that [ANSI-escape sequences](http://en.wikipedia.org/wiki/ANSI_escape_code) aren't used. 
This is necessary for displaying the format in a browser, as well as for using the 'watch' command-line utility.

## Example usage [#example-usage]

## Format settings [#format-settings]

<PrettyFormatSettings/>
