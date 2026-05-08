const Subject = require('../models/Subject');

const DEFAULT_TOPICS = {
  OOPS: ['Classes & Objects', 'Inheritance', 'Polymorphism', 'Encapsulation', 'Abstraction', 'Interfaces', 'Abstract Classes', 'Design Patterns', 'SOLID Principles', 'Exception Handling'],
  DBMS: ['ER Diagrams', 'Normalization (1NF-BCNF)', 'SQL Queries', 'Joins', 'Transactions & ACID', 'Indexing', 'B-Trees', 'Concurrency Control', 'NoSQL Basics', 'CAP Theorem'],
  OS: ['Process Management', 'Threads', 'CPU Scheduling', 'Memory Management', 'Virtual Memory', 'Paging & Segmentation', 'File Systems', 'I/O Systems', 'Deadlocks', 'Semaphores & Mutex'],
  CN: ['OSI Model', 'TCP/IP Model', 'IP Addressing & Subnetting', 'DNS & DHCP', 'HTTP/HTTPS', 'TCP vs UDP', 'Routing Protocols', 'Network Security', 'Sockets', 'Load Balancing']
};

const getAll = async (req, res, next) => {
  try {
    let subjects = await Subject.find({ user: req.user._id });
    
    // Initialize subjects if not present
    if (subjects.length === 0) {
      const subjectNames = ['OOPS', 'DBMS', 'OS', 'CN'];
      subjects = await Subject.insertMany(
        subjectNames.map(s => ({
          user: req.user._id,
          subject: s,
          topics: DEFAULT_TOPICS[s].map(name => ({ name }))
        }))
      );
    }
    
    res.json({ success: true, subjects });
  } catch (err) { next(err); }
};

const updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.json({ success: true, subject });
  } catch (err) { next(err); }
};

const updateTopic = async (req, res, next) => {
  try {
    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id, 'topics._id': req.params.topicId },
      {
        $set: {
          'topics.$.covered': req.body.covered,
          'topics.$.revisionStatus': req.body.revisionStatus,
          'topics.$.confidence': req.body.confidence,
          'topics.$.notes': req.body.notes,
          ...(req.body.covered && { 'topics.$.coveredAt': new Date() })
        },
        updatedAt: new Date()
      },
      { new: true }
    );
    res.json({ success: true, subject });
  } catch (err) { next(err); }
};

module.exports = { getAll, updateSubject, updateTopic };
