const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.authSession.deleteMany();
  await prisma.otpCode.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.bookingStatusLog.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.workerApplicationSkill.deleteMany();
  await prisma.workerApplication.deleteMany();
  await prisma.workerSkill.deleteMany();
  await prisma.service.deleteMany();
  await prisma.serviceCategory.deleteMany();
  await prisma.worker.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  await prisma.serviceCategory.create({
    data: {
      name: 'Cleaning',
      slug: 'cleaning',
      description: 'Daily-life cleaning services with visible outcomes and repeat demand.',
      icon: 'Sparkles',
      services: {
        create: [
          {
            name: 'Bathroom Deep Cleaning',
            slug: 'bathroom-deep-cleaning',
            description: 'Deep clean bathroom surfaces, tiles, fittings, and floor.',
            expectedDurationMin: 90,
            basePrice: 499,
            maxPrice: 899,
            complexity: 1,
            completionProof: 'Before/after photos + customer confirmation'
          },
          {
            name: 'Kitchen Cleaning',
            slug: 'kitchen-cleaning',
            description: 'Counter, sink, slab, shelves exterior, and floor cleaning.',
            expectedDurationMin: 120,
            basePrice: 699,
            maxPrice: 1299,
            complexity: 2,
            completionProof: 'Before/after photos + checklist'
          },
          {
            name: 'Room Cleaning',
            slug: 'room-cleaning',
            description: 'Dusting, floor cleaning, and surface wipe for 1 room.',
            expectedDurationMin: 60,
            basePrice: 299,
            maxPrice: 499,
            complexity: 1,
            completionProof: 'Before/after photos'
          }
        ]
      }
    }
  });

  await prisma.serviceCategory.create({
    data: {
      name: 'Basic Plumbing',
      slug: 'basic-plumbing',
      description: 'Small issue-based plumbing work with inspection clarity.',
      icon: 'Droplets',
      services: {
        create: [
          {
            name: 'Tap Leak Repair',
            slug: 'tap-leak-repair',
            description: 'Fix common leakage in taps and fittings.',
            expectedDurationMin: 45,
            basePrice: 249,
            maxPrice: 599,
            complexity: 1,
            completionProof: 'Leak test + customer confirmation'
          },
          {
            name: 'Washbasin Blockage Removal',
            slug: 'washbasin-blockage-removal',
            description: 'Clear common basin blockage and restore flow.',
            expectedDurationMin: 60,
            basePrice: 299,
            maxPrice: 699,
            complexity: 2,
            completionProof: 'Water flow test + photo'
          },
          {
            name: 'Flush Issue Check',
            slug: 'flush-issue-check',
            description: 'Check and fix common flush tank issues.',
            expectedDurationMin: 60,
            basePrice: 349,
            maxPrice: 899,
            complexity: 2,
            completionProof: 'Functional test'
          }
        ]
      }
    }
  });

  await prisma.serviceCategory.create({
    data: {
      name: 'Basic Electrical',
      slug: 'basic-electrical',
      description: 'Defined household electrical jobs with clear completion tests.',
      icon: 'Zap',
      services: {
        create: [
          {
            name: 'Switch / Socket Repair',
            slug: 'switch-socket-repair',
            description: 'Repair or replace faulty switch or socket.',
            expectedDurationMin: 45,
            basePrice: 249,
            maxPrice: 699,
            complexity: 1,
            completionProof: 'Power test + customer confirmation'
          },
          {
            name: 'Fan Installation',
            slug: 'fan-installation',
            description: 'Install or refit ceiling fan safely.',
            expectedDurationMin: 60,
            basePrice: 399,
            maxPrice: 999,
            complexity: 2,
            completionProof: 'Operational test'
          },
          {
            name: 'Light Replacement',
            slug: 'light-replacement',
            description: 'Replace tube, bulb, or light fixture.',
            expectedDurationMin: 30,
            basePrice: 199,
            maxPrice: 499,
            complexity: 1,
            completionProof: 'Operational test'
          }
        ]
      }
    }
  });

  const services = await prisma.service.findMany();
  const tapRepair = services.find((s) => s.slug === 'tap-leak-repair');
  const bathroomCleaning = services.find((s) => s.slug === 'bathroom-deep-cleaning');
  const switchRepair = services.find((s) => s.slug === 'switch-socket-repair');
  const washbasinBlockage = services.find((s) => s.slug === 'washbasin-blockage-removal');
  const kitchenCleaning = services.find((s) => s.slug === 'kitchen-cleaning');

  const customerUser = await prisma.user.create({
    data: {
      name: 'Rahul Sharma',
      phone: '9999999901',
      role: 'CUSTOMER',
      city: 'Jaipur',
      customer: {
        create: {
          address: 'Vaishali Nagar, Jaipur',
          trustScore: 84
        }
      }
    },
    include: { customer: true }
  });

  const adminUser = await prisma.user.create({
    data: {
      name: 'TrustMitra Ops',
      phone: '9999999900',
      role: 'ADMIN',
      city: 'Jaipur'
    }
  });

  const workerAUser = await prisma.user.create({
    data: {
      name: 'Suresh Verma',
      phone: '9999999902',
      role: 'WORKER',
      city: 'Jaipur',
      worker: {
        create: {
          bio: 'Small home repair specialist focused on plumbing fixes.',
          level: 'TRUSTED',
          identityStatus: 'VERIFIED',
          skillStatus: 'VERIFIED',
          onTimeScore: 92,
          completionRate: 96,
          trustScore: 91,
          totalJobs: 38,
          repeatCustomerPct: 41,
          cancellationRate: 3,
          complaintRate: 2,
          availability: '8 AM - 8 PM',
          area: 'Vaishali Nagar'
        }
      }
    },
    include: { worker: true }
  });

  const workerBUser = await prisma.user.create({
    data: {
      name: 'Imran Khan',
      phone: '9999999903',
      role: 'WORKER',
      city: 'Jaipur',
      worker: {
        create: {
          bio: 'Cleaning and home care worker with strong punctuality.',
          level: 'RATED',
          identityStatus: 'VERIFIED',
          skillStatus: 'VERIFIED',
          onTimeScore: 90,
          completionRate: 93,
          trustScore: 87,
          totalJobs: 22,
          repeatCustomerPct: 33,
          cancellationRate: 5,
          complaintRate: 4,
          availability: '9 AM - 6 PM',
          area: 'Mansarovar'
        }
      }
    },
    include: { worker: true }
  });

  const workerCUser = await prisma.user.create({
    data: {
      name: 'Rakesh Meena',
      phone: '9999999904',
      role: 'WORKER',
      city: 'Jaipur',
      worker: {
        create: {
          bio: 'Electrical fixes, fan, socket, and light repair specialist.',
          level: 'PRO',
          identityStatus: 'VERIFIED',
          skillStatus: 'VERIFIED',
          onTimeScore: 95,
          completionRate: 97,
          trustScore: 94,
          totalJobs: 61,
          repeatCustomerPct: 45,
          cancellationRate: 2,
          complaintRate: 1,
          availability: '10 AM - 8 PM',
          area: 'Malviya Nagar'
        }
      }
    },
    include: { worker: true }
  });

  await prisma.workerSkill.createMany({
    data: [
      { workerId: workerAUser.worker.id, serviceId: tapRepair.id, approved: true, experienceY: 5 },
      { workerId: workerAUser.worker.id, serviceId: washbasinBlockage.id, approved: true, experienceY: 4 },
      { workerId: workerBUser.worker.id, serviceId: bathroomCleaning.id, approved: true, experienceY: 3 },
      { workerId: workerBUser.worker.id, serviceId: kitchenCleaning.id, approved: true, experienceY: 2 },
      { workerId: workerCUser.worker.id, serviceId: switchRepair.id, approved: true, experienceY: 6 }
    ]
  });

  const inProgressBooking = await prisma.booking.create({
    data: {
      serviceId: tapRepair.id,
      customerId: customerUser.customer.id,
      workerId: workerAUser.worker.id,
      issue: 'Kitchen tap is leaking continuously from the neck joint.',
      address: 'Vaishali Nagar, Jaipur',
      preferredTime: new Date(Date.now() + 1000 * 60 * 60 * 2),
      notes: 'Please bring standard washer if possible.',
      issuePhotoUrl: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=1200&auto=format&fit=crop',
      estimatedAmount: 349,
      finalAmount: 349,
      otpCode: '4821',
      otpVerifiedAt: new Date(),
      status: 'IN_PROGRESS',
      statusLogs: {
        create: [
          { status: 'ASSIGNED', note: 'Best matched worker assigned.' },
          { status: 'ARRIVED', note: 'Worker reached location.' },
          { status: 'OTP_VERIFIED', note: 'Customer shared OTP successfully.' },
          { status: 'IN_PROGRESS', note: 'Repair underway.' }
        ]
      },
      payment: {
        create: {
          amountHeld: 349,
          platformFee: 35,
          workerPayout: 314,
          status: 'HELD'
        }
      }
    }
  });

  await prisma.booking.create({
    data: {
      serviceId: bathroomCleaning.id,
      customerId: customerUser.customer.id,
      workerId: workerBUser.worker.id,
      issue: 'Need full bathroom deep cleaning before guests arrive.',
      address: 'Vaishali Nagar, Jaipur',
      preferredTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
      notes: 'Focus on tiles and floor stains.',
      estimatedAmount: 699,
      finalAmount: 699,
      otpCode: '9572',
      otpVerifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 25),
      status: 'COMPLETED',
      customerConfirmed: true,
      completionNote: 'Bathroom cleaned well, tiles look much better.',
      completionPhotoUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200&auto=format&fit=crop',
      reworkEligibleUntil: new Date(Date.now() + 1000 * 60 * 60 * 24),
      statusLogs: {
        create: [
          { status: 'ASSIGNED', note: 'Worker assigned.' },
          { status: 'ARRIVED', note: 'Worker arrived on time.' },
          { status: 'OTP_VERIFIED', note: 'Job start verified.' },
          { status: 'IN_PROGRESS', note: 'Cleaning in progress.' },
          { status: 'COMPLETED', note: 'Customer confirmed completion and payout release.' }
        ]
      },
      payment: {
        create: {
          amountHeld: 699,
          platformFee: 70,
          workerPayout: 629,
          status: 'RELEASED',
          releaseDueAt: new Date(Date.now() - 1000 * 60 * 60 * 20)
        }
      },
      reviews: {
        create: {
          reviewerId: customerUser.id,
          rating: 5,
          feedback: 'On time and neat work.'
        }
      }
    }
  });

  const disputedBooking = await prisma.booking.create({
    data: {
      serviceId: switchRepair.id,
      customerId: customerUser.customer.id,
      workerId: workerCUser.worker.id,
      issue: 'Bedroom switch sparks on use.',
      address: 'Malviya Nagar, Jaipur',
      preferredTime: new Date(Date.now() - 1000 * 60 * 60 * 5),
      notes: 'Urgent evening visit preferred.',
      estimatedAmount: 299,
      finalAmount: 399,
      otpCode: '6314',
      otpVerifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
      status: 'DISPUTED',
      completionNote: 'Socket was changed but spark issue still appears sometimes.',
      statusLogs: {
        create: [
          { status: 'ASSIGNED', note: 'Assigned to top-rated nearby worker.' },
          { status: 'ARRIVED', note: 'Worker reached customer location.' },
          { status: 'OTP_VERIFIED', note: 'Customer shared OTP.' },
          { status: 'IN_PROGRESS', note: 'Repair started.' },
          { status: 'COMPLETED', note: 'Worker marked job complete. Customer did not confirm.' },
          { status: 'DISPUTED', note: 'Customer raised quality issue and payout is held.' }
        ]
      },
      payment: {
        create: {
          amountHeld: 399,
          platformFee: 40,
          workerPayout: 359,
          status: 'HELD'
        }
      },
      tickets: {
        create: {
          createdById: customerUser.id,
          type: 'QUALITY_ISSUE',
          title: 'Spark issue still happening',
          description: 'Switch was changed but problem is still not fully resolved. Need rework review.',
          status: 'IN_REVIEW'
        }
      }
    }
  });



  await prisma.notificationEvent.createMany({
    data: [
      {
        bookingId: inProgressBooking.id,
        userId: customerUser.id,
        template: 'booking_created',
        message: 'Your plumbing booking is active and payment is held safely.',
        channel: 'APP',
        status: 'SENT'
      },
      {
        bookingId: disputedBooking.id,
        userId: workerCUser.id,
        template: 'ticket_opened',
        message: 'A support ticket is under review for your electrical job.',
        channel: 'APP',
        status: 'PENDING'
      },
      {
        userId: adminUser.id,
        template: 'worker_application_received',
        message: 'A new worker application is waiting for review.',
        channel: 'APP',
        status: 'PENDING'
      }
    ]
  });

  await prisma.auditLog.createMany({
    data: [
      {
        actorUserId: customerUser.id,
        action: 'booking.created',
        entityType: 'booking',
        entityId: inProgressBooking.id,
        metadata: JSON.stringify({ flow: 'seeded_phase3_demo' })
      },
      {
        actorUserId: adminUser.id,
        action: 'ticket.reviewed',
        entityType: 'ticket',
        entityId: disputedBooking.id,
        metadata: JSON.stringify({ note: 'Seeded admin review state' })
      }
    ]
  });

  await prisma.workerApplication.create({
    data: {
      name: 'Amit Kumar',
      phone: '9999999911',
      city: 'Jaipur',
      area: 'Vaishali Nagar',
      experienceY: 2,
      availability: '9 AM - 7 PM',
      bio: 'I handle basic plumbing and electrical jobs in homes.',
      skills: {
        create: [
          { serviceId: tapRepair.id, experienceY: 2 },
          { serviceId: switchRepair.id, experienceY: 2 }
        ]
      }
    }
  });

  console.log({
    inProgressBooking: inProgressBooking.id,
    disputedBooking: disputedBooking.id,
    admin: adminUser.name
  });
}

main().finally(async () => {
  await prisma.$disconnect();
});
