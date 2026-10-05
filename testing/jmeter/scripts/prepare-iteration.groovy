import groovy.json.JsonOutput

def wordSearch = (ctx.getThreadNum() + vars.getIteration()) % 2 == 0
def fixture = wordSearch ? 'word-search' : 'wordle'
def type = wordSearch ? 'WORD_SEARCH' : 'WORDLE'
def name = 'JMeter ' + UUID.randomUUID().toString()
def words = [
    [word: 'thin', phonemes: ['\u03b8', '\u026a', 'n'], hint: 'TH as in thin'],
    [word: 'ship', phonemes: ['\u0283', '\u026a', 'p']],
    [word: 'chin', phonemes: ['t\u0283', '\u026a', 'n']],
    [word: 'jam', phonemes: ['d\u0292', '\u00e6', 'm']],
    [word: 'ring', phonemes: ['\u0279', '\u026a', '\u014b']],
]
vars.put('listId', '')
vars.put('activityId', '')
vars.put('activityType', type)
vars.put('builderPath', wordSearch ? '/word-search' : '/wordle')
vars.put('testName', name)
vars.put('fixtureName', fixture)
vars.put('wordListPayload', JsonOutput.toJson([
    name: name, source: 'JMeter load test', description: 'JMeter initial list', words: words,
]))
vars.put('updatedListPayload', JsonOutput.toJson([
    name: name, source: 'JMeter load test', description: 'JMeter updated list', words: words,
]))
vars.put('outputPayload', JsonOutput.toJson([
    filename: fixture + '.html', html: props.getProperty('fixture.' + fixture),
]))
SampleResult.setIgnore()
