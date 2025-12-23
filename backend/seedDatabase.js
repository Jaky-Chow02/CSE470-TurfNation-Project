const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const Turf = require('./models/Turf');
const Tournament = require('./models/Tournament');
const Rewards = require('./models/Rewards');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected for seeding...'))
  .catch(err => console.error('Connection error:', err));

const seedDatabase = async () => {
  try {
    console.log('Clearing existing data...');
    await User.deleteMany();
    await Turf.deleteMany();
    await Tournament.deleteMany();
    await Rewards.deleteMany();

    console.log('Creating users...');
    const password = await bcrypt.hash('password123', 10);
    
    const users = await User.create([
      {
        name: 'John Doe',
        email: 'john@example.com',
        password,
        phone: '01712345678',
        role: 'user',
        statistics: { totalBookings: 8, hoursPlayed: 20, favoriteSport: 'Football' }
      },
      {
        name: 'Sarah Khan',
        email: 'sarah@example.com',
        password,
        phone: '01723456789',
        role: 'user',
        statistics: { totalBookings: 5, hoursPlayed: 12, favoriteSport: 'Badminton' }
      },
      {
        name: 'Ahmed Ali',
        email: 'ahmed@example.com',
        password,
        phone: '01734567890',
        role: 'user'
      },
      {
        name: 'Turf Owner Dhaka',
        email: 'owner1@example.com',
        password,
        phone: '01745678901',
        role: 'turf_owner'
      },
      {
        name: 'Turf Owner Gulshan',
        email: 'owner2@example.com',
        password,
        phone: '01756789012',
        role: 'turf_owner'
      },
      {
        name: 'Admin User',
        email: 'admin@turfnation.com',
        password,
        phone: '01767890123',
        role: 'admin'
      }
    ]);

    console.log(`Created ${users.length} users`);

    console.log('Creating turfs...');
    const turfs = await Turf.create([
      {
        name: 'Green Field Sports Complex',
        owner: users[3]._id,
        description: 'Premium football and cricket turf with floodlights and modern changing rooms. Perfect for competitive matches and training sessions.',
        location: {
          address: 'House 45, Road 27, Banani',
          city: 'Dhaka',
          coordinates: { latitude: 23.7937, longitude: 90.4066 }
        },
        sports: ['Football', 'Cricket'],
        facilities: ['Parking', 'Washroom', 'Changing Room', 'Drinking Water', 'Lighting', 'Seating'],
        images: ['https://via.placeholder.com/400x300?text=Green+Field'],
        pricePerHour: 2000,
        availability: {
          monday: { open: '06:00', close: '23:00', available: true },
          tuesday: { open: '06:00', close: '23:00', available: true },
          wednesday: { open: '06:00', close: '23:00', available: true },
          thursday: { open: '06:00', close: '23:00', available: true },
          friday: { open: '06:00', close: '23:00', available: true },
          saturday: { open: '06:00', close: '23:00', available: true },
          sunday: { open: '06:00', close: '23:00', available: true }
        },
        condition: 'Excellent',
        rating: { average: 4.8, count: 42 },
        isActive: true,
        announcements: [
          { message: 'New LED floodlights installed!', createdAt: new Date() }
        ]
      },
      {
        name: 'Urban Sports Arena',
        owner: users[3]._id,
        description: 'Multi-sport indoor facility in Gulshan. Air-conditioned badminton and tennis courts with professional equipment.',
        location: {
          address: 'Plot 12, Gulshan Avenue, Gulshan',
          city: 'Dhaka',
          coordinates: { latitude: 23.7809, longitude: 90.4192 }
        },
        sports: ['Badminton', 'Tennis', 'Basketball', 'Table Tennis'],
        facilities: ['Parking', 'Washroom', 'Changing Room', 'Cafeteria', 'First Aid', 'Drinking Water'],
        images: ['https://via.placeholder.com/400x300?text=Urban+Arena'],
        pricePerHour: 1500,
        availability: {
          monday: { open: '07:00', close: '23:00', available: true },
          tuesday: { open: '07:00', close: '23:00', available: true },
          wednesday: { open: '07:00', close: '23:00', available: true },
          thursday: { open: '07:00', close: '23:00', available: true },
          friday: { open: '07:00', close: '23:00', available: true },
          saturday: { open: '07:00', close: '23:00', available: true },
          sunday: { open: '07:00', close: '23:00', available: true }
        },
        condition: 'Excellent',
        rating: { average: 4.6, count: 35 },
        isActive: true
      },
      {
        name: 'Dhanmondi Sports Hub',
        owner: users[4]._id,
        description: 'Community sports center offering cricket, football, and hockey. Family-friendly environment with spectator seating.',
        location: {
          address: 'Road 8A, Dhanmondi',
          city: 'Dhaka',
          coordinates: { latitude: 23.7461, longitude: 90.3742 }
        },
        sports: ['Football', 'Cricket', 'Hockey'],
        facilities: ['Parking', 'Washroom', 'Lighting', 'Seating', 'Drinking Water'],
        images: ['https://via.placeholder.com/400x300?text=Dhanmondi+Hub'],
        pricePerHour: 1800,
        availability: {
          monday: { open: '06:00', close: '22:00', available: true },
          tuesday: { open: '06:00', close: '22:00', available: true },
          wednesday: { open: '06:00', close: '22:00', available: true },
          thursday: { open: '06:00', close: '22:00', available: true },
          friday: { open: '06:00', close: '22:00', available: true },
          saturday: { open: '06:00', close: '22:00', available: true },
          sunday: { open: '06:00', close: '22:00', available: true }
        },
        condition: 'Good',
        rating: { average: 4.3, count: 28 },
        isActive: true
      },
      {
        name: 'Mirpur Cricket Academy',
        owner: users[4]._id,
        description: 'Professional cricket facility with nets and full-size pitch. Coaching sessions available. Used by local clubs for training.',
        location: {
          address: 'Section 2, Mirpur',
          city: 'Dhaka',
          coordinates: { latitude: 23.8223, longitude: 90.3654 }
        },
        sports: ['Cricket'],
        facilities: ['Parking', 'Washroom', 'Changing Room', 'Cafeteria', 'First Aid', 'Seating'],
        images: ['https://via.placeholder.com/400x300?text=Mirpur+Cricket'],
        pricePerHour: 2500,
        availability: {
          monday: { open: '05:00', close: '21:00', available: true },
          tuesday: { open: '05:00', close: '21:00', available: true },
          wednesday: { open: '05:00', close: '21:00', available: true },
          thursday: { open: '05:00', close: '21:00', available: true },
          friday: { open: '05:00', close: '21:00', available: true },
          saturday: { open: '05:00', close: '21:00', available: true },
          sunday: { open: '05:00', close: '21:00', available: true }
        },
        condition: 'Excellent',
        rating: { average: 4.9, count: 56 },
        isActive: true
      },
      {
        name: 'Uttara Badminton Center',
        owner: users[4]._id,
        description: 'Specialized badminton facility with 8 courts. Air-conditioned hall with wooden flooring. Table tennis also available.',
        location: {
          address: 'Sector 7, Uttara',
          city: 'Dhaka',
          coordinates: { latitude: 23.8759, longitude: 90.3795 }
        },
        sports: ['Badminton', 'Table Tennis'],
        facilities: ['Parking', 'Washroom', 'Changing Room', 'Drinking Water', 'Cafeteria'],
        images: ['https://via.placeholder.com/400x300?text=Uttara+Badminton'],
        pricePerHour: 1200,
        availability: {
          monday: { open: '08:00', close: '23:00', available: true },
          tuesday: { open: '08:00', close: '23:00', available: true },
          wednesday: { open: '08:00', close: '23:00', available: true },
          thursday: { open: '08:00', close: '23:00', available: true },
          friday: { open: '08:00', close: '23:00', available: true },
          saturday: { open: '08:00', close: '23:00', available: true },
          sunday: { open: '08:00', close: '23:00', available: true }
        },
        condition: 'Excellent',
        rating: { average: 4.7, count: 31 },
        isActive: true
      },
      {
        name: 'Mohammadpur Football Ground',
        owner: users[4]._id,
        description: 'Large outdoor football field with natural grass. Ideal for 11-a-side matches. Weekend tournaments hosted regularly.',
        location: {
          address: 'Block C, Mohammadpur',
          city: 'Dhaka',
          coordinates: { latitude: 23.7654, longitude: 90.3563 }
        },
        sports: ['Football'],
        facilities: ['Parking', 'Washroom', 'Lighting', 'Seating'],
        images: ['https://via.placeholder.com/400x300?text=Mohammadpur+Football'],
        pricePerHour: 1600,
        availability: {
          monday: { open: '06:00', close: '22:00', available: true },
          tuesday: { open: '06:00', close: '22:00', available: true },
          wednesday: { open: '06:00', close: '22:00', available: true },
          thursday: { open: '06:00', close: '22:00', available: true },
          friday: { open: '06:00', close: '22:00', available: true },
          saturday: { open: '06:00', close: '22:00', available: true },
          sunday: { open: '06:00', close: '22:00', available: true }
        },
        condition: 'Good',
        rating: { average: 4.2, count: 24 },
        isActive: true
      },
      {
        name: 'Bashundhara Tennis Club',
        owner: users[3]._id,
        description: 'Premium tennis facility with 4 synthetic courts. Professional coaching available. Member-only tournaments.',
        location: {
          address: 'Block J, Bashundhara R/A',
          city: 'Dhaka',
          coordinates: { latitude: 23.8103, longitude: 90.4336 }
        },
        sports: ['Tennis'],
        facilities: ['Parking', 'Washroom', 'Changing Room', 'Cafeteria', 'First Aid'],
        images: ['https://via.placeholder.com/400x300?text=Bashundhara+Tennis'],
        pricePerHour: 2200,
        availability: {
          monday: { open: '06:00', close: '22:00', available: true },
          tuesday: { open: '06:00', close: '22:00', available: true },
          wednesday: { open: '06:00', close: '22:00', available: true },
          thursday: { open: '06:00', close: '22:00', available: true },
          friday: { open: '06:00', close: '22:00', available: true },
          saturday: { open: '06:00', close: '22:00', available: true },
          sunday: { open: '06:00', close: '22:00', available: true }
        },
        condition: 'Excellent',
        rating: { average: 4.8, count: 18 },
        isActive: true
      }
    ]);

    console.log(`Created ${turfs.length} turfs`);

    console.log('Creating tournaments...');
    const tournaments = await Tournament.create([
      {
        name: 'Dhaka Premier Football League 2024',
        creator: users[0]._id,
        turf: turfs[0]._id,
        sport: 'Football',
        description: 'Annual football championship for amateur teams. Trophy and cash prizes for winners!',
        type: 'league',
        startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
        registrationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxTeams: 8,
        minPlayersPerTeam: 7,
        maxPlayersPerTeam: 11,
        entryFee: 5000,
        prizePool: { first: 30000, second: 15000, third: 5000 },
        status: 'open',
        rules: ['11-a-side format', '2 x 45 minute halves', 'FIFA rules apply', 'Fair play code enforced'],
        isApprovedByTurf: true,
        visibility: 'public'
      },
      {
        name: 'Weekend Cricket Cup',
        creator: users[1]._id,
        turf: turfs[3]._id,
        sport: 'Cricket',
        description: 'Fast-paced T20 cricket tournament. All skill levels welcome!',
        type: 'knockout',
        startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000),
        registrationDeadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        maxTeams: 8,
        minPlayersPerTeam: 11,
        maxPlayersPerTeam: 15,
        entryFee: 3000,
        prizePool: { first: 20000, second: 10000 },
        status: 'open',
        rules: ['T20 format', 'Standard cricket rules', 'Umpire decisions final'],
        isApprovedByTurf: true,
        visibility: 'public'
      },
      {
        name: 'Badminton Singles Championship',
        creator: users[2]._id,
        turf: turfs[4]._id,
        sport: 'Badminton',
        description: 'Individual badminton competition. Singles only. Best of 3 games format.',
        type: 'knockout',
        startDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        registrationDeadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
        maxTeams: 16,
        minPlayersPerTeam: 1,
        maxPlayersPerTeam: 1,
        entryFee: 500,
        prizePool: { first: 5000, second: 2500, third: 1000 },
        status: 'open',
        rules: ['BWF rules', 'Best of 3 games', '21 points per game'],
        isApprovedByTurf: true,
        visibility: 'public'
      }
    ]);

    console.log(`Created ${tournaments.length} tournaments`);

    console.log('Creating rewards...');
    const rewards = await Rewards.create([
      {
        user: users[0]._id,
        points: 280,
        level: { current: 3, name: 'Regular', pointsToNextLevel: 220 },
        badges: [
          { name: 'First Booking', description: 'Made your first booking', category: 'bookings', earnedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          { name: '10 Hours Milestone', description: 'Played for 10 hours', category: 'hours', earnedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
          { name: 'Tournament Player', description: 'Participated in a tournament', category: 'tournaments', earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        ],
        achievements: {
          totalBookings: 8,
          totalHoursPlayed: 20,
          uniqueSportsPlayed: 3,
          tournamentsParticipated: 1,
          tournamentsWon: 0
        },
        streaks: { current: 3, longest: 5, lastPlayedDate: new Date() }
      },
      {
        user: users[1]._id,
        points: 150,
        level: { current: 2, name: 'Amateur', pointsToNextLevel: 100 },
        badges: [
          { name: 'First Booking', description: 'Made your first booking', category: 'bookings', earnedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
          { name: '5 Hours Milestone', description: 'Played for 5 hours', category: 'hours', earnedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) }
        ],
        achievements: {
          totalBookings: 5,
          totalHoursPlayed: 12,
          uniqueSportsPlayed: 2,
          tournamentsParticipated: 0
        },
        streaks: { current: 1, longest: 3, lastPlayedDate: new Date() }
      },
      {
        user: users[2]._id,
        points: 50,
        level: { current: 1, name: 'Beginner', pointsToNextLevel: 50 },
        badges: [
          { name: 'First Booking', description: 'Made your first booking', category: 'bookings', earnedAt: new Date() }
        ],
        achievements: {
          totalBookings: 2,
          totalHoursPlayed: 4,
          uniqueSportsPlayed: 1
        },
        streaks: { current: 1, longest: 1, lastPlayedDate: new Date() }
      }
    ]);

    console.log(`Created ${rewards.length} reward profiles`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`- ${users.length} users created`);
    console.log(`- ${turfs.length} turfs created`);
    console.log(`- ${tournaments.length} tournaments created`);
    console.log(`- ${rewards.length} reward profiles created`);
    console.log('\n🔑 Sample Credentials:');
    console.log('User: john@example.com / password123');
    console.log('User: sarah@example.com / password123');
    console.log('User: ahmed@example.com / password123');
    console.log('Owner: owner1@example.com / password123');
    console.log('Owner: owner2@example.com / password123');
    console.log('Admin: admin@turfnation.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();