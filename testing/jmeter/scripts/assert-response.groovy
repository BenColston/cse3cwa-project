import groovy.json.JsonOutput
import groovy.json.JsonSlurper

def label = prev.getSampleLabel()
def expectedCodes = [
    'Health': '200', 'Builder page': '200', 'Create word list': '201',
    'Read word list': '200', 'Update word list': '200', 'Create activity': '201',
    'Read activity': '200', 'Store generated HTML': '201', 'Read generated HTML': '200',
    'Delete activity': '204', 'Delete word list': '204',
]
if (!expectedCodes.containsKey(label)) return

try {
    assert prev.getResponseCode() == expectedCodes[label] : 'Unexpected HTTP status ' + prev.getResponseCode()
    if (label == 'Builder page') {
        assert prev.getResponseDataAsString().contains('<html') : 'Builder HTML is missing'
        return
    }
    if (label.startsWith('Delete')) return
    def data = new JsonSlurper().parseText(prev.getResponseDataAsString())
    switch (label) {
        case 'Health':
            assert data.status == 'ok'
            break
        case 'Create word list':
            assert data.wordList.id && data.wordList.words.size() == 5
            vars.put('listId', data.wordList.id)
            def settings = vars.get('activityType') == 'WORDLE'
                ? [targetEnglish: 'thin', targetPhonemes: ['\u03b8', '\u026a', 'n'], maxGuesses: 6, sourceName: 'JMeter load test']
                : [rows: 8, cols: 8, wordCount: 5, sourceName: 'JMeter load test']
            vars.put('activityPayload', JsonOutput.toJson([
                name: vars.get('testName'), type: vars.get('activityType'),
                difficulty: 'EASY', wordListId: data.wordList.id, settings: settings,
            ]))
            break
        case 'Read word list':
        case 'Update word list':
            assert data.wordList.id == vars.get('listId')
            assert data.wordList.name == vars.get('testName')
            assert data.wordList.words.size() == 5
            assert data.wordList.words.find { it.word == 'thin' }.phonemes == ['\u03b8', '\u026a', 'n']
            if (label == 'Update word list') assert data.wordList.description == 'JMeter updated list'
            break
        case 'Create activity':
            assert data.activity.id && data.activity.type == vars.get('activityType')
            vars.put('activityId', data.activity.id)
            break
        case 'Read activity':
            assert data.activity.id == vars.get('activityId')
            assert data.activity.wordListId == vars.get('listId')
            break
        case 'Store generated HTML':
            assert data.output.id
            assert data.output.html == props.getProperty('fixture.' + vars.get('fixtureName'))
            break
        case 'Read generated HTML':
            assert data.outputs.size() == 1
            assert data.outputs[0].filename == vars.get('fixtureName') + '.html'
            assert data.outputs[0].html == props.getProperty('fixture.' + vars.get('fixtureName'))
            break
    }
} catch (Throwable error) {
    AssertionResult.setFailure(true)
    AssertionResult.setFailureMessage(label + ': ' + error.message)
}
