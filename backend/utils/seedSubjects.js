const Subject = require('../models/Subject');

const defaultCSESubjects = [
  { subjectName: 'Data Structures & Algorithms', description: 'Core programming concepts and problem-solving techniques' },
  { subjectName: 'Operating Systems', description: 'System software that manages computer hardware and software resources' },
  { subjectName: 'Database Management Systems', description: 'Software system for creating and managing databases' },
  { subjectName: 'Computer Networks', description: 'Study of interconnected computing devices that can exchange data' },
  { subjectName: 'Theory of Computation', description: 'Branch dealing with what problems can be solved on a model of computation' },
  { subjectName: 'Compiler Design', description: 'Principles and practices for design of compilers and interpreters' },
  { subjectName: 'Software Engineering', description: 'Systematic application of engineering approaches to software development' },
  { subjectName: 'Artificial Intelligence', description: 'Intelligence demonstrated by machines' },
  { subjectName: 'Machine Learning', description: 'Study of computer algorithms that improve automatically through experience' },
  { subjectName: 'Cloud Computing', description: 'On-demand availability of computer system resources' },
  { subjectName: 'Cyber Security', description: 'Protection of computer systems and networks from information disclosure' },
  { subjectName: 'Distributed Systems', description: 'System whose components are located on different networked computers' },
  { subjectName: 'Web Development', description: 'Work involved in developing a website for the Internet' },
  { subjectName: 'Computer Architecture', description: 'Rules and methods that describe the functionality of computer systems' }
];

const seedSubjects = async () => {
  try {
    const count = await Subject.countDocuments();
    if (count === 0) {
      console.log('No subjects found in database. Seeding default CSE subjects...');
      await Subject.insertMany(defaultCSESubjects);
      console.log('Successfully seeded 14 default CSE subjects.');
    } else {
      console.log(`Subjects collection already has ${count} records. Seeding skipped.`);
    }
  } catch (error) {
    console.error('Error seeding subjects:', error.message);
  }
};

module.exports = seedSubjects;
