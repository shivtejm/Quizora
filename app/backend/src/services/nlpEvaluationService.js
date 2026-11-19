// ==========================================================
// Smart Interview Evaluation System - NLP Scoring Engine
// ==========================================================

const KEYWORDS = {
    JavaScript: ['function', 'variable', 'scope', 'hoisting', 'closure', 'callback', 'promise', 'async', 'prototype', 'es6', 'const', 'let', 'var', 'arrow', 'object', 'array'],
    React: ['component', 'state', 'props', 'virtual dom', 'render', 'hook', 'usestate', 'useeffect', 'jsx', 'lifecycle', 'reconciliation', 'fiber'],
    DSA: ['algorithm', 'complexity', 'sort', 'search', 'tree', 'graph', 'stack', 'queue', 'hash', 'binary', 'linked list', 'recursion', 'dynamic programming', 'big o'],
    Database: ['sql', 'nosql', 'query', 'table', 'index', 'normalization', 'schema', 'join', 'transaction', 'acid', 'mongodb', 'relational', 'document'],
    OOP: ['class', 'object', 'inheritance', 'polymorphism', 'encapsulation', 'abstraction', 'interface', 'solid', 'single responsibility', 'open closed', 'liskov', 'dependency'],
    Architecture: ['microservice', 'monolithic', 'api', 'gateway', 'service', 'scalab', 'deploy', 'container', 'docker', 'kubernetes', 'load balancer', 'decouple'],
    'Web Development': ['rest', 'api', 'http', 'get', 'post', 'put', 'delete', 'endpoint', 'resource', 'stateless', 'json', 'status code', 'url'],
    Behavioral: ['team', 'challenge', 'learn', 'experience', 'goal', 'communicate', 'collaborate', 'problem', 'solution', 'leader', 'manage', 'improve', 'growth']
};

const POSITIVE_WORDS = ['excellent', 'great', 'good', 'strong', 'effective', 'successful', 'achieved', 'improved', 'innovative', 'efficient', 'productive', 'proactive', 'dedicated', 'passionate', 'skilled'];
const NEGATIVE_WORDS = ['bad', 'poor', 'weak', 'failed', 'struggle', 'difficult', 'unable', 'confused', 'problem', 'issue'];

function evaluateAnswer(answerText, questionObj) {
    if (answerText === undefined || answerText === null || String(answerText).trim().length === 0) {
        return {
            score: 0,
            isCorrect: false,
            feedback: 'No option selected for this question.',
            commScore: 0,
            keywordsFound: []
        };
    }

    const options = questionObj.options || [];
    const correctIdx = (typeof questionObj.correctAnswer === 'number')
        ? questionObj.correctAnswer
        : parseInt(questionObj.correctAnswer || 0);

    let selectedIdx = -1;
    if (!isNaN(answerText) && String(answerText).trim() !== '') {
        selectedIdx = parseInt(answerText);
    } else {
        selectedIdx = options.findIndex(opt => opt.trim().toLowerCase() === String(answerText).trim().toLowerCase());
    }

    const isCorrect = (selectedIdx === correctIdx);
    const correctLetter = ['A', 'B', 'C', 'D'][correctIdx] || String(correctIdx + 1);
    const correctText = options[correctIdx] || `Option ${correctLetter}`;

    const selectedLetter = selectedIdx >= 0 && selectedIdx < 4 ? ['A', 'B', 'C', 'D'][selectedIdx] : '?';
    const selectedText = selectedIdx >= 0 && options[selectedIdx] ? options[selectedIdx] : String(answerText);

    if (isCorrect) {
        return {
            score: 100,
            isCorrect: true,
            feedback: `✓ Correct! Selected Option ${selectedLetter}: "${selectedText}".`,
            commScore: 100,
            keywordsFound: [selectedText]
        };
    } else {
        return {
            score: 0,
            isCorrect: false,
            feedback: `✗ Incorrect. You selected Option ${selectedLetter}: "${selectedText}". The correct answer is Option ${correctLetter}: "${correctText}".`,
            commScore: selectedIdx >= 0 ? 50 : 0,
            keywordsFound: []
        };
    }
}

module.exports = {
    evaluateAnswer,
    KEYWORDS
};
