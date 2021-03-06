const mongoose = require('mongoose');
const Course = mongoose.model('Course');
const Student = mongoose.model('Student');

function getErrorMessage(err) {
    if (err.errors) {
        for (let errName in err.errors) {
            if (err.errors[errName].message) return err.errors[errName].
                message;
        }
    } else {
        return 'Unknown server error';
    }
};


exports.create = function (req, res) {
    const course = new Course();

    course.courseCode = req.body.courseCode;
    course.courseName = req.body.courseName;
    course.section = req.body.section;
    course.semester = req.body.semester;

    console.log(req.body)

    Student.findOne({ studentNumber: req.body.studentNumber }, (err, student) => {

        if (err) { return getErrorMessage(err); }

        req.id = student._id;
        console.log('student._id: ', req.id);
    }).then(function () {
        course.student = req.id;
        console.log('req.student._id: ', req.id);

        course.save((err) => {
            if (err) {
                console.log('error', getErrorMessage(err))

                return res.status(400).send({
                    message: getErrorMessage(err)
                });
            } else {
                res.status(200).json(course);
            }
        });
    });
};


exports.courseByStudentId = function (req, res) {
    Course.find({
        student: req.student
    }, (err, courses) => {
        if (err) {
            return res.status(400).send({
                message: getErrorMessage(err)
            });
        } else {
            res.status(200).json(courses);
        }
    });
};


exports.list = function (req, res) {
    Course.find().distinct('courseName').populate('student', 'firstName lastName fullName').exec((err, courses) => {
        if (err) {
            return res.status(400).send({
                message: getErrorMessage(err)
            });
        } else {
            res.status(200).json(courses);
        }
    });
};


exports.courseByID = function (req, res, next, id) {
    Course.findById(id).populate('student', 'firstName lastName fullName').exec((err, course) => {
        if (err) return next(err);
        if (!course) return next(new Error('Failed to load the course '
            + id));
        req.course = course;
        console.log('in courseById:', req.course);
        next();
    });
};


exports.studentInCourse = function (req, res, next, courseName) {
    Course.find({courseName: courseName}).populate('student', 'firstName lastName fullName email program').exec((err, course) => {
        if (err) return next(err);
        if (!course) return next(new Error('Failed to load the course '
            + id));
        req.course = course;
        console.log('in courseById:', req.course);
        next();
    });
};


exports.read = function (req, res) {
    res.status(200).json(req.course);
};


exports.update = function (req, res) {
    console.log('in update:', req.course)

    const course = req.course;

    course.courseCode = req.body.courseCode;
    course.courseName = req.body.courseName;
    course.section = req.body.section;
    course.semester = req.body.semester;

    course.save((err) => {
        if (err) {
            return res.status(400).send({
                message: getErrorMessage(err)
            });
        } else {
            res.status(200).json(course);
        }
    });
};


exports.delete = function (req, res) {
    const course = req.course;
    course.remove((err) => {
        if (err) {
            return res.status(400).send({
                message: getErrorMessage(err)
            });
        } else {
            res.status(200).json(course);
        }
    });
};

exports.hasAuthorization = function (req, res, next) {
    console.log('in hasAuthorization - student: ', req.course.student);
    console.log('in hasAuthorization - student user: ', req.id);

    if (req.course.student.id !== req.id) {
        return res.status(403).send({
            message: 'Student is not authorized'
        });
    }
    next();
};
