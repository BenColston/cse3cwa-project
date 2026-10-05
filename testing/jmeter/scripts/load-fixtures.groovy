def directory = new File(props.getProperty('planDir', 'testing/jmeter'), 'fixtures')
['wordle', 'word-search'].each { name ->
    def fixture = new File(directory, name + '.html')
    if (!fixture.isFile()) {
        throw new IllegalStateException('Export the builder fixtures first: ' + fixture)
    }
    def html = fixture.getText('UTF-8')
    if (!html.toLowerCase().contains('<!doctype html')) {
        throw new IllegalStateException('Invalid HTML fixture: ' + fixture)
    }
    props.put('fixture.' + name, html)
}
SampleResult.setIgnore()
