import dotenv from 'dotenv';
dotenv.config();

import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Continue if custom DNS set is restricted
}

import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Department from '../src/models/Department.js';
import Course from '../src/models/Course.js';
import Subject from '../src/models/Subject.js';
import Faculty from '../src/models/Faculty.js';
import Student from '../src/models/Student.js';
import Enrollment from '../src/models/Enrollment.js';
import Attendance from '../src/models/Attendance.js';
import Examination from '../src/models/Examination.js';
import Result from '../src/models/Result.js';

import { sanitizeMongoUri, ATLAS_DIRECT_REPLICA_URI } from '../src/config/database.js';

const RAW_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://balamurugan:bala%402007@cluster0.spoq4xe.mongodb.net/college_management?retryWrites=true&w=majority';
const MONGODB_URI = sanitizeMongoUri(RAW_URI);

export async function seed(shouldExit = true) {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('🔄 Connecting to MongoDB for seeding at:', MONGODB_URI.replace(/:([^@]+)@/, ':****@'));
      try {
        await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
      } catch (srvErr) {
        console.warn('⚠️ Primary SRV seed connection failed:', srvErr.message);
        console.log('🔄 Connecting directly via Atlas replica-set fallback...');
        await mongoose.connect(ATLAS_DIRECT_REPLICA_URI, { serverSelectionTimeoutMS: 8000 });
      }
    }
    console.log('✅ Connected to MongoDB host:', mongoose.connection.host);

    console.log('🧹 Cleaning existing data...');
    await Promise.all([
      User.deleteMany({}),
      Department.deleteMany({}),
      Course.deleteMany({}),
      Subject.deleteMany({}),
      Faculty.deleteMany({}),
      Student.deleteMany({}),
      Enrollment.deleteMany({}),
      Attendance.deleteMany({}),
      Examination.deleteMany({}),
      Result.deleteMany({}),
    ]);
    console.log('✅ Existing collections purged.');

    // 1. Create Admin User
    console.log('👤 Creating Admin user...');
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@college.edu',
      passwordHash: 'Admin@123',
      role: 'ADMIN',
      accountStatus: 'ACTIVE',
    });

    // 2. Create Departments
    console.log('🏢 Creating Engineering & Academic Departments...');
    const cseDept = await Department.create({
      name: 'Computer Science & Engineering',
      code: 'CSE',
      description: 'Software engineering, artificial intelligence, algorithms, and distributed systems.',
    });

    const aidsDept = await Department.create({
      name: 'Artificial Intelligence & Data Science',
      code: 'AIDS',
      description: 'Machine learning, deep neural networks, big data analytics, and computational intelligence.',
    });

    const itDept = await Department.create({
      name: 'Information Technology',
      code: 'IT',
      description: 'Cloud architecture, cybersecurity, web applications, and database administration.',
    });

    const eceDept = await Department.create({
      name: 'Electronics & Communication Engineering',
      code: 'ECE',
      description: 'VLSI microelectronics, embedded systems, telecommunications, and digital signal processing.',
    });

    const eeeDept = await Department.create({
      name: 'Electrical & Electronics Engineering',
      code: 'EEE',
      description: 'Power systems, smart grids, electric vehicles, and industrial automation.',
    });

    const meDept = await Department.create({
      name: 'Mechanical Engineering',
      code: 'ME',
      description: 'Robotics, thermodynamics, aerospace structures, and automated manufacturing.',
    });

    const ceDept = await Department.create({
      name: 'Civil Engineering',
      code: 'CE',
      description: 'Structural design, environmental engineering, geotechnical analysis, and infrastructure.',
    });

    const aeDept = await Department.create({
      name: 'Aerospace Engineering',
      code: 'AE',
      description: 'Aerodynamics, propulsion systems, flight mechanics, and space technologies.',
    });

    const bmeDept = await Department.create({
      name: 'Biomedical Engineering',
      code: 'BME',
      description: 'Medical instrumentation, physiological modeling, and health informatics.',
    });

    const cheDept = await Department.create({
      name: 'Chemical Engineering',
      code: 'CHE',
      description: 'Process engineering, biochemical synthesis, and sustainable energy materials.',
    });

    const mbaDept = await Department.create({
      name: 'School of Management Studies',
      code: 'SMS',
      description: 'Executive management, financial strategy, and technology operations.',
    });

    // 3. Create Courses
    console.log('📚 Creating Courses...');
    const btechCse = await Course.create({
      name: 'B.Tech in Computer Science & Engineering',
      code: 'BTECH-CSE',
      department: cseDept._id,
      program: 'Undergraduate',
      duration: 4,
      totalSemesters: 8,
      credits: 160,
      description: 'Four-year program in computer science, software design, and algorithms.',
    });

    const btechAids = await Course.create({
      name: 'B.Tech in Artificial Intelligence & Data Science',
      code: 'BTECH-AIDS',
      department: aidsDept._id,
      program: 'Undergraduate',
      duration: 4,
      totalSemesters: 8,
      credits: 160,
      description: 'Four-year degree focusing on machine intelligence, neural networks, and data analytics.',
    });

    const btechIt = await Course.create({
      name: 'B.Tech in Information Technology',
      code: 'BTECH-IT',
      department: itDept._id,
      program: 'Undergraduate',
      duration: 4,
      totalSemesters: 8,
      credits: 160,
      description: 'Four-year engineering program covering cybersecurity, cloud, and enterprise systems.',
    });

    const btechEce = await Course.create({
      name: 'B.Tech in Electronics & Communication',
      code: 'BTECH-ECE',
      department: eceDept._id,
      program: 'Undergraduate',
      duration: 4,
      totalSemesters: 8,
      credits: 160,
      description: 'Four-year program in electronics, signal processing, and communication networks.',
    });

    const btechEee = await Course.create({
      name: 'B.Tech in Electrical & Electronics Engineering',
      code: 'BTECH-EEE',
      department: eeeDept._id,
      program: 'Undergraduate',
      duration: 4,
      totalSemesters: 8,
      credits: 160,
      description: 'Four-year program in power systems, electric mobility, and control engineering.',
    });

    const btechMe = await Course.create({
      name: 'B.Tech in Mechanical Engineering',
      code: 'BTECH-ME',
      department: meDept._id,
      program: 'Undergraduate',
      duration: 4,
      totalSemesters: 8,
      credits: 160,
      description: 'Four-year program in mechanical design, thermal dynamics, and robotics.',
    });

    const btechCe = await Course.create({
      name: 'B.Tech in Civil Engineering',
      code: 'BTECH-CE',
      department: ceDept._id,
      program: 'Undergraduate',
      duration: 4,
      totalSemesters: 8,
      credits: 160,
      description: 'Four-year engineering program in infrastructure, hydrology, and structural analysis.',
    });

    const btechAe = await Course.create({
      name: 'B.Tech in Aerospace Engineering',
      code: 'BTECH-AE',
      department: aeDept._id,
      program: 'Undergraduate',
      duration: 4,
      totalSemesters: 8,
      credits: 160,
      description: 'Four-year degree in aerodynamics, avionics, and space vehicles.',
    });

    const btechBme = await Course.create({
      name: 'B.Tech in Biomedical Engineering',
      code: 'BTECH-BME',
      department: bmeDept._id,
      program: 'Undergraduate',
      duration: 4,
      totalSemesters: 8,
      credits: 160,
      description: 'Four-year program merging biological science and medical electronic devices.',
    });

    const btechChe = await Course.create({
      name: 'B.Tech in Chemical Engineering',
      code: 'BTECH-CHE',
      department: cheDept._id,
      program: 'Undergraduate',
      duration: 4,
      totalSemesters: 8,
      credits: 160,
      description: 'Four-year program in industrial biochemical processes and materials science.',
    });

    const mbaCourse = await Course.create({
      name: 'Master of Business Administration',
      code: 'MBA',
      department: mbaDept._id,
      program: 'Postgraduate',
      duration: 2,
      totalSemesters: 4,
      credits: 100,
      description: 'Two-year executive program in business strategy, finance, and product management.',
    });

    // 4. Create Subjects
    console.log('📖 Creating Academic Subjects for All Engineering & Management Programs...');
    
    // CSE Subjects
    const dsa = await Subject.create({
      name: 'Data Structures and Algorithms',
      code: 'CS101',
      course: btechCse._id,
      semester: 1,
      credits: 4,
      description: 'Linear and non-linear data structures, trees, graphs, sorting, and algorithmic complexity.',
    });
    const dbms = await Subject.create({
      name: 'Database Management Systems',
      code: 'CS201',
      course: btechCse._id,
      semester: 2,
      credits: 4,
      description: 'Relational models, SQL, indexing, transaction management, and NoSQL architecture.',
    });
    const oopJava = await Subject.create({
      name: 'Object-Oriented Programming with Java',
      code: 'CS202',
      course: btechCse._id,
      semester: 2,
      credits: 4,
      description: 'Object-oriented patterns, multithreading, collections, and modern Java runtime.',
    });
    const os = await Subject.create({
      name: 'Operating Systems & Architecture',
      code: 'CS203',
      course: btechCse._id,
      semester: 2,
      credits: 3,
      description: 'Process scheduling, virtual memory, concurrency primitives, and file systems.',
    });

    // AI & DS Subjects
    const aiml = await Subject.create({
      name: 'Foundations of Machine Learning & Statistics',
      code: 'AI201',
      course: btechAids._id,
      semester: 2,
      credits: 4,
      description: 'Supervised/unsupervised algorithms, regression, decision trees, and gradient boosting.',
    });
    const deepLearning = await Subject.create({
      name: 'Deep Neural Networks & Computer Vision',
      code: 'AI202',
      course: btechAids._id,
      semester: 2,
      credits: 4,
      description: 'Convolutional neural networks, Transformers, backpropagation, and PyTorch.',
    });
    const bigData = await Subject.create({
      name: 'Big Data Engineering & Distributed Systems',
      code: 'DS203',
      course: btechAids._id,
      semester: 2,
      credits: 3,
      description: 'Apache Spark, Kafka real-time streaming, lakehouses, and distributed ETL pipelines.',
    });

    // IT Subjects
    const cloudComp = await Subject.create({
      name: 'Cloud Computing & Microservices',
      code: 'IT201',
      course: btechIt._id,
      semester: 2,
      credits: 4,
      description: 'AWS/GCP architectures, Kubernetes container orchestration, and serverless compute.',
    });
    const cyberSec = await Subject.create({
      name: 'Network Security & Applied Cryptography',
      code: 'IT202',
      course: btechIt._id,
      semester: 2,
      credits: 4,
      description: 'Public key infrastructure, TLS protocols, penetration testing, and zero trust architecture.',
    });
    const webArch = await Subject.create({
      name: 'Full Stack Enterprise Web Systems',
      code: 'IT203',
      course: btechIt._id,
      semester: 2,
      credits: 3,
      description: 'Modern asynchronous JavaScript, React components, RESTful API design, and GraphQL.',
    });

    // ECE Subjects
    const signals = await Subject.create({
      name: 'Signals and Linear Systems',
      code: 'ECE201',
      course: btechEce._id,
      semester: 2,
      credits: 4,
      description: 'Continuous and discrete Fourier analysis, Laplace transform, and LTI systems.',
    });
    const dsp = await Subject.create({
      name: 'Digital Signal Processing & Filter Design',
      code: 'ECE202',
      course: btechEce._id,
      semester: 2,
      credits: 4,
      description: 'Z-transforms, IIR/FIR filters, FFT algorithms, and spectral estimation.',
    });
    const vlsi = await Subject.create({
      name: 'VLSI Circuit Design & Embedded Silicon',
      code: 'ECE203',
      course: btechEce._id,
      semester: 2,
      credits: 3,
      description: 'CMOS logic gates, FPGA prototyping, Verilog HDL synthesis, and physical layout.',
    });

    // EEE Subjects
    const powerSys = await Subject.create({
      name: 'Electrical Power Systems & Smart Grids',
      code: 'EEE201',
      course: btechEee._id,
      semester: 2,
      credits: 4,
      description: 'Transmission line modeling, load flow analysis, renewable integration, and protection relays.',
    });
    const evDrives = await Subject.create({
      name: 'Electric Vehicle Powertrains & Motor Drives',
      code: 'EEE202',
      course: btechEee._id,
      semester: 2,
      credits: 4,
      description: 'BLDC/PMSM motor control, inverters, regenerative braking, and battery management systems.',
    });
    const controlSys = await Subject.create({
      name: 'Feedback Control Systems Engineering',
      code: 'EEE203',
      course: btechEee._id,
      semester: 2,
      credits: 3,
      description: 'Root locus, Bode plots, state-space representations, and PID controller tuning.',
    });

    // Mechanical Engineering Subjects
    const thermo = await Subject.create({
      name: 'Applied Thermodynamics & Heat Transfer',
      code: 'ME201',
      course: btechMe._id,
      semester: 2,
      credits: 4,
      description: 'Brayton/Rankine thermodynamic cycles, conduction, convection, and heat exchanger analysis.',
    });
    const robotics = await Subject.create({
      name: 'Industrial Robotics & Mechatronics',
      code: 'ME202',
      course: btechMe._id,
      semester: 2,
      credits: 4,
      description: 'Kinematics, inverse kinematics, robotic arm trajectories, actuators, and PLC automation.',
    });
    const cadSolid = await Subject.create({
      name: 'Solid Mechanics & Computer-Aided Design (CAD)',
      code: 'ME203',
      course: btechMe._id,
      semester: 2,
      credits: 3,
      description: 'Stress-strain tensors, finite element modeling, Mohr circles, and parametric 3D CAD modeling.',
    });

    // Civil Engineering Subjects
    const structAnalysis = await Subject.create({
      name: 'Structural Analysis & Reinforced Concrete',
      code: 'CE201',
      course: btechCe._id,
      semester: 2,
      credits: 4,
      description: 'Bending moment distributions, shear forces, deflection of beams, and Eurocode/IS concrete standards.',
    });
    const geotech = await Subject.create({
      name: 'Geotechnical & Foundation Engineering',
      code: 'CE202',
      course: btechCe._id,
      semester: 2,
      credits: 4,
      description: 'Soil classification, shear strength, bearing capacity of shallow and pile foundations.',
    });
    const hydrology = await Subject.create({
      name: 'Hydrology & Water Resource Management',
      code: 'CE203',
      course: btechCe._id,
      semester: 2,
      credits: 3,
      description: 'Precipitation runoff modeling, open channel hydraulics, and urban drainage networks.',
    });

    // Aerospace Engineering Subjects (Crucial for B.Tech Aerospace)
    const aeroDynamics = await Subject.create({
      name: 'Aerodynamics & High-Speed Fluid Mechanics',
      code: 'AE201',
      course: btechAe._id,
      semester: 2,
      credits: 4,
      description: 'Subsonic/supersonic potential flow, airfoil lift/drag polars, boundary layer theory, and shock waves.',
    });
    const flightPropulsion = await Subject.create({
      name: 'Flight Mechanics & Spacecraft Rocket Propulsion',
      code: 'AE202',
      course: btechAe._id,
      semester: 2,
      credits: 4,
      description: 'Aircraft flight stability, turbofan engine cycles, solid/liquid rocket engines, and orbital maneuvers.',
    });
    const avionics = await Subject.create({
      name: 'Aerospace Structural Dynamics & Avionics Systems',
      code: 'AE203',
      course: btechAe._id,
      semester: 2,
      credits: 3,
      description: 'Aeroelastic flutter, thin-walled aircraft structures, inertial navigation (IMU/GPS), and flight management computers.',
    });

    // Biomedical Engineering Subjects
    const bioInst = await Subject.create({
      name: 'Biomedical Electronic Instrumentation & Sensors',
      code: 'BME201',
      course: btechBme._id,
      semester: 2,
      credits: 4,
      description: 'ECG/EMG biopotential amplifiers, biosensors, electrical safety, and medical imaging transducers.',
    });
    const biomech = await Subject.create({
      name: 'Biomechanics, Implants & Biomaterials',
      code: 'BME202',
      course: btechBme._id,
      semester: 2,
      credits: 4,
      description: 'Orthopedic joint kinematics, biocompatible titanium alloys, hydrogels, and prosthetic limb design.',
    });
    const medImaging = await Subject.create({
      name: 'Medical Signal & Diagnostic Image Processing',
      code: 'BME203',
      course: btechBme._id,
      semester: 2,
      credits: 3,
      description: 'MRI k-space reconstruction, CT scan filtered backprojection, ultrasound beamforming, and AI radiology.',
    });

    // Chemical Engineering Subjects
    const chemReact = await Subject.create({
      name: 'Chemical Reaction Engineering & Kinetics',
      code: 'CHE201',
      course: btechChe._id,
      semester: 2,
      credits: 4,
      description: 'Batch, CSTR, and PFR reactor modeling, catalyst selectivity, and exothermic runaway safety.',
    });
    const processControl = await Subject.create({
      name: 'Process Dynamics, Instrumentation & Automation',
      code: 'CHE202',
      course: btechChe._id,
      semester: 2,
      credits: 4,
      description: 'Transfer functions, frequency response, distillation column multivariable control, and SCADA.',
    });
    const massTransfer = await Subject.create({
      name: 'Mass Transfer & Separation Unit Operations',
      code: 'CHE203',
      course: btechChe._id,
      semester: 2,
      credits: 3,
      description: 'McCabe-Thiele fractional distillation, liquid-liquid extraction, membrane separation, and crystallization.',
    });

    // MBA Subjects
    const finance = await Subject.create({
      name: 'Corporate Financial Strategy & Valuation',
      code: 'MBA101',
      course: mbaCourse._id,
      semester: 1,
      credits: 3,
      description: 'Discounted cash flows, capital structure optimization, mergers & acquisitions, and corporate governance.',
    });
    const mktg = await Subject.create({
      name: 'Marketing Management & Brand Strategy',
      code: 'MBA102',
      course: mbaCourse._id,
      semester: 1,
      credits: 3,
      description: 'Consumer psychographics, digital omni-channel acquisition, pricing models, and brand equity.',
    });
    const supplyChain = await Subject.create({
      name: 'Global Supply Chain Strategy & Logistics',
      code: 'MBA201',
      course: mbaCourse._id,
      semester: 2,
      credits: 3,
      description: 'Inventory optimization, lean six sigma manufacturing, global freight logistics, and enterprise ERP systems.',
    });

    // 5. Create Faculty
    console.log('👨‍🏫 Creating Faculty members...');
    
    // Faculty 1: Alan Turing (CSE)
    const turingUser = await User.create({
      name: 'Dr. Alan Turing',
      email: 'faculty@college.edu',
      passwordHash: 'Faculty@123',
      role: 'FACULTY',
      accountStatus: 'ACTIVE',
    });
    const turingFaculty = await Faculty.create({
      user: turingUser._id,
      employeeId: 'FAC001',
      department: cseDept._id,
      assignedSubjects: [dbms._id, oopJava._id],
      phone: '+1-555-0101',
      qualification: 'Ph.D. in Computer Science',
      specialization: 'Database Systems & Theory of Computation',
      joiningDate: new Date('2021-08-15'),
      address: 'Suite 404, Science Block, Campus',
    });
    await User.findByIdAndUpdate(turingUser._id, { facultyProfile: turingFaculty._id });

    // Faculty 2: Grace Hopper (CSE)
    const hopperUser = await User.create({
      name: 'Dr. Grace Hopper',
      email: 'hopper@college.edu',
      passwordHash: 'Faculty@123',
      role: 'FACULTY',
      accountStatus: 'ACTIVE',
    });
    const hopperFaculty = await Faculty.create({
      user: hopperUser._id,
      employeeId: 'FAC002',
      department: cseDept._id,
      assignedSubjects: [os._id, dsa._id],
      phone: '+1-555-0102',
      qualification: 'Ph.D. in Mathematics & Computer Systems',
      specialization: 'Compilers and Operating Systems',
      joiningDate: new Date('2020-07-01'),
      address: 'Suite 405, Science Block, Campus',
    });
    await User.findByIdAndUpdate(hopperUser._id, { facultyProfile: hopperFaculty._id });

    // Faculty 3: Claude Shannon (ECE)
    const shannonUser = await User.create({
      name: 'Prof. Claude Shannon',
      email: 'shannon@college.edu',
      passwordHash: 'Faculty@123',
      role: 'FACULTY',
      accountStatus: 'ACTIVE',
    });
    const shannonFaculty = await Faculty.create({
      user: shannonUser._id,
      employeeId: 'FAC003',
      department: eceDept._id,
      assignedSubjects: [signals._id, dsp._id, vlsi._id],
      phone: '+1-555-0103',
      qualification: 'Ph.D. in Electrical Engineering',
      specialization: 'Information Theory & Digital Communication',
      joiningDate: new Date('2019-01-10'),
      address: 'Suite 201, Engineering Complex, Campus',
    });
    await User.findByIdAndUpdate(shannonUser._id, { facultyProfile: shannonFaculty._id });

    // Faculty 4: Dr. Robert Goddard (Aerospace Engineering)
    const goddardUser = await User.create({
      name: 'Dr. Robert Goddard',
      email: 'goddard@college.edu',
      passwordHash: 'Faculty@123',
      role: 'FACULTY',
      accountStatus: 'ACTIVE',
    });
    const goddardFaculty = await Faculty.create({
      user: goddardUser._id,
      employeeId: 'FAC004',
      department: aeDept._id,
      assignedSubjects: [aeroDynamics._id, flightPropulsion._id, avionics._id],
      phone: '+1-555-0104',
      qualification: 'Ph.D. in Aerospace & Rocket Propulsion',
      specialization: 'Hypersonic Aerodynamics & Spacecraft Systems',
      joiningDate: new Date('2018-03-20'),
      address: 'Suite 101, Aerospace Hangar Lab, Campus',
    });
    await User.findByIdAndUpdate(goddardUser._id, { facultyProfile: goddardFaculty._id });

    // Faculty 5: Dr. Geoffrey Hinton (AI & DS)
    const hintonUser = await User.create({
      name: 'Dr. Geoffrey Hinton',
      email: 'hinton@college.edu',
      passwordHash: 'Faculty@123',
      role: 'FACULTY',
      accountStatus: 'ACTIVE',
    });
    const hintonFaculty = await Faculty.create({
      user: hintonUser._id,
      employeeId: 'FAC005',
      department: aidsDept._id,
      assignedSubjects: [aiml._id, deepLearning._id, bigData._id],
      phone: '+1-555-0105',
      qualification: 'Ph.D. in Cognitive & Neural Systems',
      specialization: 'Deep Artificial Neural Architectures',
      joiningDate: new Date('2019-09-01'),
      address: 'Suite 302, AI Innovation Center, Campus',
    });
    await User.findByIdAndUpdate(hintonUser._id, { facultyProfile: hintonFaculty._id });

    // Assign faculty to all subjects
    await Subject.findByIdAndUpdate(dbms._id, { assignedFaculty: [turingFaculty._id] });
    await Subject.findByIdAndUpdate(oopJava._id, { assignedFaculty: [turingFaculty._id] });
    await Subject.findByIdAndUpdate(os._id, { assignedFaculty: [hopperFaculty._id] });
    await Subject.findByIdAndUpdate(dsa._id, { assignedFaculty: [hopperFaculty._id] });
    await Subject.findByIdAndUpdate(signals._id, { assignedFaculty: [shannonFaculty._id] });
    await Subject.findByIdAndUpdate(dsp._id, { assignedFaculty: [shannonFaculty._id] });
    await Subject.findByIdAndUpdate(vlsi._id, { assignedFaculty: [shannonFaculty._id] });
    await Subject.findByIdAndUpdate(aeroDynamics._id, { assignedFaculty: [goddardFaculty._id] });
    await Subject.findByIdAndUpdate(flightPropulsion._id, { assignedFaculty: [goddardFaculty._id] });
    await Subject.findByIdAndUpdate(avionics._id, { assignedFaculty: [goddardFaculty._id] });
    await Subject.findByIdAndUpdate(aiml._id, { assignedFaculty: [hintonFaculty._id] });
    await Subject.findByIdAndUpdate(deepLearning._id, { assignedFaculty: [hintonFaculty._id] });
    await Subject.findByIdAndUpdate(bigData._id, { assignedFaculty: [hintonFaculty._id] });
    await Subject.findByIdAndUpdate(cloudComp._id, { assignedFaculty: [turingFaculty._id] });
    await Subject.findByIdAndUpdate(cyberSec._id, { assignedFaculty: [turingFaculty._id] });
    await Subject.findByIdAndUpdate(webArch._id, { assignedFaculty: [turingFaculty._id] });
    await Subject.findByIdAndUpdate(powerSys._id, { assignedFaculty: [shannonFaculty._id] });
    await Subject.findByIdAndUpdate(evDrives._id, { assignedFaculty: [shannonFaculty._id] });
    await Subject.findByIdAndUpdate(controlSys._id, { assignedFaculty: [shannonFaculty._id] });
    await Subject.findByIdAndUpdate(thermo._id, { assignedFaculty: [goddardFaculty._id] });
    await Subject.findByIdAndUpdate(robotics._id, { assignedFaculty: [goddardFaculty._id] });
    await Subject.findByIdAndUpdate(cadSolid._id, { assignedFaculty: [goddardFaculty._id] });
    await Subject.findByIdAndUpdate(structAnalysis._id, { assignedFaculty: [goddardFaculty._id] });
    await Subject.findByIdAndUpdate(geotech._id, { assignedFaculty: [goddardFaculty._id] });
    await Subject.findByIdAndUpdate(hydrology._id, { assignedFaculty: [goddardFaculty._id] });
    await Subject.findByIdAndUpdate(bioInst._id, { assignedFaculty: [shannonFaculty._id] });
    await Subject.findByIdAndUpdate(biomech._id, { assignedFaculty: [shannonFaculty._id] });
    await Subject.findByIdAndUpdate(medImaging._id, { assignedFaculty: [shannonFaculty._id] });
    await Subject.findByIdAndUpdate(chemReact._id, { assignedFaculty: [goddardFaculty._id] });
    await Subject.findByIdAndUpdate(processControl._id, { assignedFaculty: [goddardFaculty._id] });
    await Subject.findByIdAndUpdate(massTransfer._id, { assignedFaculty: [goddardFaculty._id] });
    await Subject.findByIdAndUpdate(finance._id, { assignedFaculty: [turingFaculty._id] });
    await Subject.findByIdAndUpdate(mktg._id, { assignedFaculty: [turingFaculty._id] });
    await Subject.findByIdAndUpdate(supplyChain._id, { assignedFaculty: [turingFaculty._id] });

    // Set Department Heads
    await Department.findByIdAndUpdate(cseDept._id, { departmentHead: turingFaculty._id });
    await Department.findByIdAndUpdate(eceDept._id, { departmentHead: shannonFaculty._id });
    await Department.findByIdAndUpdate(aeDept._id, { departmentHead: goddardFaculty._id });
    await Department.findByIdAndUpdate(aidsDept._id, { departmentHead: hintonFaculty._id });

    // 6. Create Enrolled Students across ALL engineering programs
    console.log('🎓 Creating Enrolled Students across All Degree Programs...');
    const studentsData = [
      // CSE Students
      { name: 'Alex Mercer', email: 'student@college.edu', password: 'Student@123', rollNumber: 'CSE2024001', regNo: 'REG-2024-CSE-001', dept: cseDept._id, course: btechCse._id, sem: 2, phone: '+1-555-0201', guardian: 'Richard Mercer' },
      { name: 'Sophia Patel', email: 'sophia@college.edu', password: 'Student@123', rollNumber: 'CSE2024002', regNo: 'REG-2024-CSE-002', dept: cseDept._id, course: btechCse._id, sem: 2, phone: '+1-555-0202', guardian: 'Sunil Patel' },
      { name: 'Liam Chen', email: 'liam@college.edu', password: 'Student@123', rollNumber: 'CSE2024003', regNo: 'REG-2024-CSE-003', dept: cseDept._id, course: btechCse._id, sem: 2, phone: '+1-555-0203', guardian: 'David Chen' },
      { name: 'Emma Watson', email: 'emma@college.edu', password: 'Student@123', rollNumber: 'CSE2024004', regNo: 'REG-2024-CSE-004', dept: cseDept._id, course: btechCse._id, sem: 2, phone: '+1-555-0204', guardian: 'Chris Watson' },

      // Aerospace Engineering Students (AE) - Essential for user
      { name: 'Neil Armstrong', email: 'neil@college.edu', password: 'Student@123', rollNumber: 'AE2024001', regNo: 'REG-2024-AE-001', dept: aeDept._id, course: btechAe._id, sem: 2, phone: '+1-555-0210', guardian: 'Stephen Armstrong' },
      { name: 'Sally Ride', email: 'sally@college.edu', password: 'Student@123', rollNumber: 'AE2024002', regNo: 'REG-2024-AE-002', dept: aeDept._id, course: btechAe._id, sem: 2, phone: '+1-555-0211', guardian: 'Dale Ride' },
      { name: 'Kalpana Chawla', email: 'kalpana@college.edu', password: 'Student@123', rollNumber: 'AE2024003', regNo: 'REG-2024-AE-003', dept: aeDept._id, course: btechAe._id, sem: 2, phone: '+1-555-0212', guardian: 'Banarasi Chawla' },
      { name: 'Buzz Aldrin', email: 'buzz@college.edu', password: 'Student@123', rollNumber: 'AE2024004', regNo: 'REG-2024-AE-004', dept: aeDept._id, course: btechAe._id, sem: 2, phone: '+1-555-0213', guardian: 'Edwin Aldrin' },

      // AI & DS Students
      { name: 'Ethan Hunt', email: 'ethan@college.edu', password: 'Student@123', rollNumber: 'AIDS2024001', regNo: 'REG-2024-AIDS-001', dept: aidsDept._id, course: btechAids._id, sem: 2, phone: '+1-555-0220', guardian: 'Nathan Hunt' },
      { name: 'Anya Sharma', email: 'anya@college.edu', password: 'Student@123', rollNumber: 'AIDS2024002', regNo: 'REG-2024-AIDS-002', dept: aidsDept._id, course: btechAids._id, sem: 2, phone: '+1-555-0221', guardian: 'Rajesh Sharma' },
      { name: 'Marcus Vance', email: 'marcus@college.edu', password: 'Student@123', rollNumber: 'AIDS2024003', regNo: 'REG-2024-AIDS-003', dept: aidsDept._id, course: btechAids._id, sem: 2, phone: '+1-555-0222', guardian: 'Thomas Vance' },

      // IT Students
      { name: 'Priya Nair', email: 'priya@college.edu', password: 'Student@123', rollNumber: 'IT2024001', regNo: 'REG-2024-IT-001', dept: itDept._id, course: btechIt._id, sem: 2, phone: '+1-555-0230', guardian: 'Ramesh Nair' },
      { name: 'Jordan Lee', email: 'jordan@college.edu', password: 'Student@123', rollNumber: 'IT2024002', regNo: 'REG-2024-IT-002', dept: itDept._id, course: btechIt._id, sem: 2, phone: '+1-555-0231', guardian: 'Kevin Lee' },

      // ECE Students
      { name: 'Noah Williams', email: 'noah@college.edu', password: 'Student@123', rollNumber: 'ECE2024001', regNo: 'REG-2024-ECE-001', dept: eceDept._id, course: btechEce._id, sem: 2, phone: '+1-555-0240', guardian: 'Mary Williams' },
      { name: 'Emily Blunt', email: 'emily@college.edu', password: 'Student@123', rollNumber: 'ECE2024002', regNo: 'REG-2024-ECE-002', dept: eceDept._id, course: btechEce._id, sem: 2, phone: '+1-555-0241', guardian: 'Oliver Blunt' },

      // Mechanical Students
      { name: 'Carlos Santana', email: 'carlos@college.edu', password: 'Student@123', rollNumber: 'ME2024001', regNo: 'REG-2024-ME-001', dept: meDept._id, course: btechMe._id, sem: 2, phone: '+1-555-0250', guardian: 'Jose Santana' },
      { name: 'Oliver Queen', email: 'oliver@college.edu', password: 'Student@123', rollNumber: 'ME2024002', regNo: 'REG-2024-ME-002', dept: meDept._id, course: btechMe._id, sem: 2, phone: '+1-555-0251', guardian: 'Robert Queen' },

      // Electrical (EEE) Students
      { name: 'Ryan Reynolds', email: 'ryan@college.edu', password: 'Student@123', rollNumber: 'EEE2024001', regNo: 'REG-2024-EEE-001', dept: eeeDept._id, course: btechEee._id, sem: 2, phone: '+1-555-0260', guardian: 'Jim Reynolds' },
      { name: 'Maya Lin', email: 'maya@college.edu', password: 'Student@123', rollNumber: 'EEE2024002', regNo: 'REG-2024-EEE-002', dept: eeeDept._id, course: btechEee._id, sem: 2, phone: '+1-555-0261', guardian: 'Henry Lin' },

      // Civil Students
      { name: 'Natasha Romanoff', email: 'natasha@college.edu', password: 'Student@123', rollNumber: 'CE2024001', regNo: 'REG-2024-CE-001', dept: ceDept._id, course: btechCe._id, sem: 2, phone: '+1-555-0270', guardian: 'Alexei Romanoff' },
      { name: 'Steve Rogers', email: 'steve@college.edu', password: 'Student@123', rollNumber: 'CE2024002', regNo: 'REG-2024-CE-002', dept: ceDept._id, course: btechCe._id, sem: 2, phone: '+1-555-0271', guardian: 'Joseph Rogers' },

      // Biomedical Students
      { name: 'Jonas Salk', email: 'jonas@college.edu', password: 'Student@123', rollNumber: 'BME2024001', regNo: 'REG-2024-BME-001', dept: bmeDept._id, course: btechBme._id, sem: 2, phone: '+1-555-0280', guardian: 'Daniel Salk' },
      { name: 'Rosalind Franklin', email: 'rosalind@college.edu', password: 'Student@123', rollNumber: 'BME2024002', regNo: 'REG-2024-BME-002', dept: bmeDept._id, course: btechBme._id, sem: 2, phone: '+1-555-0281', guardian: 'Ellis Franklin' },

      // Chemical Students
      { name: 'Marie Curie', email: 'curie@college.edu', password: 'Student@123', rollNumber: 'CHE2024001', regNo: 'REG-2024-CHE-001', dept: cheDept._id, course: btechChe._id, sem: 2, phone: '+1-555-0290', guardian: 'Wladyslaw Sklodowski' },
      { name: 'Robert Boyle', email: 'boyle@college.edu', password: 'Student@123', rollNumber: 'CHE2024002', regNo: 'REG-2024-CHE-002', dept: cheDept._id, course: btechChe._id, sem: 2, phone: '+1-555-0291', guardian: 'Richard Boyle' },

      // MBA Students
      { name: 'Warren Buffett', email: 'warren@college.edu', password: 'Student@123', rollNumber: 'MBA2024001', regNo: 'REG-2024-MBA-001', dept: mbaDept._id, course: mbaCourse._id, sem: 1, phone: '+1-555-0300', guardian: 'Howard Buffett' },
      { name: 'Satya Nadella', email: 'satya@college.edu', password: 'Student@123', rollNumber: 'MBA2024002', regNo: 'REG-2024-MBA-002', dept: mbaDept._id, course: mbaCourse._id, sem: 1, phone: '+1-555-0301', guardian: 'Bukkapuram Nadella' },
    ];

    const createdStudents = [];
    for (const s of studentsData) {
      const u = await User.create({
        name: s.name,
        email: s.email,
        passwordHash: s.password,
        role: 'STUDENT',
        accountStatus: 'ACTIVE',
      });

      const st = await Student.create({
        user: u._id,
        rollNumber: s.rollNumber,
        registrationNumber: s.regNo,
        department: s.dept,
        course: s.course,
        currentSemester: s.sem,
        phone: s.phone,
        guardianName: s.guardian,
        address: 'Student Dormitory Tower A, Room 302',
        enrollmentDate: new Date('2024-08-01'),
      });

      await User.findByIdAndUpdate(u._id, { studentProfile: st._id });

      await Enrollment.create({
        student: st._id,
        course: s.course,
        semester: s.sem,
        status: 'ACTIVE',
        remarks: 'Admitted under general merit quota',
      });

      createdStudents.push(st);
    }

    // 7. Create Attendance Records for CSE, Aerospace, AI&DS and other departments
    console.log('📅 Creating Attendance records across Academic Courses...');
    const sampleDates = [
      new Date('2026-10-22T00:00:00Z'),
      new Date('2026-10-23T00:00:00Z'),
      new Date('2026-10-24T00:00:00Z'),
      new Date('2026-10-25T00:00:00Z'),
      new Date('2026-10-26T00:00:00Z'),
    ];

    const cseStudents = createdStudents.filter((s) => s.course.toString() === btechCse._id.toString());
    const aeStudents = createdStudents.filter((s) => s.course.toString() === btechAe._id.toString());
    const aidsStudents = createdStudents.filter((s) => s.course.toString() === btechAids._id.toString());
    const meStudents = createdStudents.filter((s) => s.course.toString() === btechMe._id.toString());

    for (const date of sampleDates) {
      // CSE Records
      for (const st of cseStudents) {
        const statusDbms = Math.random() > 0.15 ? 'PRESENT' : Math.random() > 0.5 ? 'LATE' : 'ABSENT';
        await Attendance.create({
          student: st._id,
          subject: dbms._id,
          course: btechCse._id,
          faculty: turingFaculty._id,
          date,
          status: statusDbms,
          remarks: statusDbms === 'LATE' ? 'Late arrival 10 min' : '',
        });

        const statusJava = Math.random() > 0.1 ? 'PRESENT' : 'ABSENT';
        await Attendance.create({
          student: st._id,
          subject: oopJava._id,
          course: btechCse._id,
          faculty: turingFaculty._id,
          date,
          status: statusJava,
          remarks: '',
        });
      }

      // Aerospace Engineering Records (AE)
      for (const st of aeStudents) {
        const statusAero = Math.random() > 0.15 ? 'PRESENT' : Math.random() > 0.5 ? 'LATE' : 'ABSENT';
        await Attendance.create({
          student: st._id,
          subject: aeroDynamics._id,
          course: btechAe._id,
          faculty: goddardFaculty._id,
          date,
          status: statusAero,
          remarks: statusAero === 'LATE' ? 'Late arrival 5 min' : '',
        });

        const statusFlight = Math.random() > 0.1 ? 'PRESENT' : 'ABSENT';
        await Attendance.create({
          student: st._id,
          subject: flightPropulsion._id,
          course: btechAe._id,
          faculty: goddardFaculty._id,
          date,
          status: statusFlight,
          remarks: '',
        });
      }

      // AI & Data Science Records
      for (const st of aidsStudents) {
        const statusAi = Math.random() > 0.12 ? 'PRESENT' : 'ABSENT';
        await Attendance.create({
          student: st._id,
          subject: aiml._id,
          course: btechAids._id,
          faculty: hintonFaculty._id,
          date,
          status: statusAi,
          remarks: '',
        });
      }

      // Mechanical Engineering Records
      for (const st of meStudents) {
        const statusMe = Math.random() > 0.15 ? 'PRESENT' : 'ABSENT';
        await Attendance.create({
          student: st._id,
          subject: thermo._id,
          course: btechMe._id,
          faculty: goddardFaculty._id,
          date,
          status: statusMe,
          remarks: '',
        });
      }
    }

    // 8. Create Examinations & Results
    console.log('📝 Creating Examinations and Results...');
    const exam1 = await Examination.create({
      name: 'Mid-Semester Examination: Database Systems',
      subject: dbms._id,
      course: btechCse._id,
      semester: 2,
      examDate: new Date('2026-10-15'),
      maxMarks: 100,
      examType: 'MID_TERM',
      isPublished: true,
      publishedAt: new Date('2026-10-18'),
      createdBy: turingUser._id,
    });

    const exam2 = await Examination.create({
      name: 'Mid-Semester Examination: Object-Oriented Java',
      subject: oopJava._id,
      course: btechCse._id,
      semester: 2,
      examDate: new Date('2026-10-17'),
      maxMarks: 100,
      examType: 'MID_TERM',
      isPublished: true,
      publishedAt: new Date('2026-10-19'),
      createdBy: turingUser._id,
    });

    const marksTable1 = [92, 85, 78, 96]; // for Alex, Sophia, Liam, Emma
    const marksTable2 = [88, 91, 74, 94];

    for (let i = 0; i < cseStudents.length; i++) {
      const st = cseStudents[i];

      const m1 = marksTable1[i] || 82;
      let g1 = m1 >= 90 ? 'A+' : m1 >= 80 ? 'A' : m1 >= 70 ? 'B+' : 'B';
      await Result.create({
        student: st._id,
        examination: exam1._id,
        subject: dbms._id,
        obtainedMarks: m1,
        maxMarks: 100,
        grade: g1,
        isPublished: true,
        remarks: 'Excellent comprehension of indexing & relational schemas.',
      });

      const m2 = marksTable2[i] || 80;
      let g2 = m2 >= 90 ? 'A+' : m2 >= 80 ? 'A' : m2 >= 70 ? 'B+' : 'B';
      await Result.create({
        student: st._id,
        examination: exam2._id,
        subject: oopJava._id,
        obtainedMarks: m2,
        maxMarks: 100,
        grade: g2,
        isPublished: true,
        remarks: 'Solid code cleanliness and concurrency implementation.',
      });
    }

    console.log('\n==========================================');
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('==========================================');
    console.log('Test Accounts Credentials:');
    console.log('👑 Admin:');
    console.log('   Email:    admin@college.edu');
    console.log('   Password: Admin@123\n');
    console.log('👨‍🏫 Faculty:');
    console.log('   Email:    faculty@college.edu (Dr. Alan Turing)');
    console.log('   Password: Faculty@123\n');
    console.log('🎓 Student:');
    console.log('   Email:    student@college.edu (Alex Mercer - Roll: CSE2024001)');
    console.log('   Password: Student@123\n');
    console.log('==========================================');

    if (shouldExit) {
      await mongoose.connection.close();
      process.exit(0);
    }
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    if (shouldExit) {
      process.exit(1);
    }
    throw err;
  }
}

// If executed directly from CLI
if (process.argv[1]?.endsWith('seed.js')) {
  seed(true);
}

