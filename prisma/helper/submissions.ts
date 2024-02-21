import { Semester } from '@prisma/client'
import { prisma } from '../../db'

// TODO: Move the data elsewhere
const courses: Array<{ code: string; name: string }> = [
  {
    code: 'NGN2001',
    name: 'Global Narratives',
  },
  {
    code: 'NTW2006',
    name: 'Human Trafficking and Labour Migration',
  },
  {
    code: 'NTW2010',
    name: 'Sites of Tourism',
  },
  {
    code: 'NTW2029',
    name: 'Evolutionary Psychology and Art',
  },
  {
    code: 'NTW2031',
    name: 'Equity and Education',
  },
  {
    code: 'NTW2032',
    name: 'Identity, Death, and Immortality',
  },
  {
    code: 'NTW2033',
    name: 'Conceptions of Human Nature',
  },
  {
    code: 'NTW2034',
    name: 'Wild and Simple: Living and Thinking Sustainably',
  },
  {
    code: 'NTW2035',
    name: 'Art and the Attention Economy',
  },
  {
    code: 'NTW2036',
    name: 'Space, Place and the Human Experience',
  },
  {
    code: 'NTW2037',
    name: 'Absences: Beyond the Edges of the Material World',
  },
  {
    code: 'NTW2038',
    name: 'Screening Historical Trauma',
  },
  {
    code: 'NGT2001',
    name: 'Global Social Thought',
  },
]

export const seedCourses = async () => {
  console.log('Seeding courses...')
  await prisma.course.createMany({
    data: courses,
  })
  console.info('Seeding courses finished.')
}

const professors: Array<{ name: string }> = [
  // NTW
  {
    name: 'Dr Leung Wing Sze',
  },
  {
    name: 'A/P Lo Mun Hou',
  },
  {
    name: 'Dr Jonathan Frome',
  },
  {
    name: 'Dr Amy Ramirez',
  },
  {
    name: 'Dr Jane Loo',
  },
  {
    name: 'Dr Maximillian Tegtmeyer',
  },
  {
    name: 'Dr David Merry',
  },
  {
    name: 'Dr Tan Teck Heng',
  },
  {
    name: 'Dr Tiffany Chuang',
  },
  {
    name: 'Dr Phillip Meadows',
  },
  {
    name: 'Dr John Rhym',
  },
  // NGN
  {
    name: 'Dr Bart Van Wassenhove',
  },
  {
    name: 'Dr Roweena Yip',
  },
  {
    name: 'Christine Tan',
  },
  {
    name: 'Dr Christine Tan',
  },
  {
    name: 'Dr Emily Dalton',
  },
  {
    name: 'Dr Hannah Smith-Drelich',
  },
  {
    name: 'Dr Carissa Foo',
  },
  {
    name: 'Dr Samar Faruqi',
  },
  {
    name: 'Dr Raahi Adhya',
  },
  // NGT
  {
    name: 'Dr Bjorn Gomez',
  },
  {
    name: 'Dr Kiven Strohm',
  },
  {
    name: 'Dr Benedek Varga',
  },
  {
    name: 'Dr Amanda Blair',
  },
  {
    name: 'Dr Chen Ying',
  },
  {
    name: 'Dr Gabriel Tusinski',
  },
]

export const seedProfessors = async () => {
  console.log('Seeding professors...')
  await prisma.professor.createMany({
    data: professors,
  })
  console.info('Seeding professors finished.')
}

const students: Array<{ name: string; matriculationNo: string }> = [
  {
    name: 'John Tan',
    matriculationNo: 'A0201234B',
  },
  {
    name: 'Jane Tan',
    matriculationNo: 'A0201235C',
  },
]

// Seed course offerings
const courseOfferings = [
  {
    course: {
      connect: {
        code: 'NTW2006',
      },
    },
    professor: {
      connect: {
        id: 1,
      },
    },
    semester: Semester['Semester2'],
    academicYear: 2022,
  },
  {
    course: {
      connect: {
        code: 'NGN2001',
      },
    },
    professor: {
      connect: {
        id: 2,
      },
    },

    semester: Semester['Semester1'],
    academicYear: 2023,
  },
]

export const seedCourseOfferings = async () => {
  console.log('Seeding course offerings...')
  await Promise.all(
    courseOfferings.map((courseOffering) =>
      prisma.courseOffering.create({ data: courseOffering })
    )
  )
  console.info('Seeding course offerings finished.')
}

export const seedStudents = async () => {
  console.log('Seeding students...')
  await prisma.student.createMany({
    data: students,
  })
  console.info('Seeding students finished.')
}

const submissions: Array<{
  title: string
  text: string
  student: {
    connect: {
      matriculationNo: string
    }
  }
  courseOffering: {
    connect: {
      id: number
    }
  }
}> = [
  {
    title: 'Human Trafficking and Labour Migration',
    text: `
# Human Trafficking and Labour Migration

Human trafficking and labor migration represent **two crucial issues** in contemporary society, practically mirroring each other's existence through the lens of economic necessity and exploitation. Labor migration, fundamentally, is the _movement_ of individuals from their homeland to foreign lands in pursuit of employment opportunities. This phenomenon is driven by the desire for a better life and the global inequity in job availability. Conversely, human trafficking is the dark shadow of labor migration, characterized by coercion, deceit, and force, leading victims into modern forms of slavery.

## The Intricate Link
The relationship between **human trafficking** and **labor migration** is deeply entwined with global economic disparities. The allure of financial stability and the promise of employment opportunities make individuals from less affluent regions vulnerable to exploitation. Traffickers capitalize on these vulnerabilities, offering deceptive opportunities for a better future that, in reality, lead to exploitative work conditions.

## Combating Human Trafficking
Addressing the challenges posed by human trafficking within the context of labor migration requires a multi-faceted approach:

- Establishing **safe, legal migration pathways** to reduce reliance on irregular channels that increase vulnerability.
- Improving economic opportunities in home countries to lessen the need for risky migration.
- Enhancing international cooperation to dismantle trafficking networks.
- Educating potential migrants about the risks of trafficking to prevent exploitation.
- Recognizing and protecting the rights of migrant workers through legal frameworks.

In conclusion, human trafficking and labor migration are complex issues that demand comprehensive, collaborative efforts to ensure migration remains a hopeful choice rather than a pathway to exploitation. Learn more about this at [United Nations Office on Drugs and Crime](https://www.unodc.org/).`,
    student: {
      connect: {
        matriculationNo: 'A0201234B',
      },
    },
    courseOffering: {
      connect: {
        id: 1,
      },
    },
  },
  {
    title: 'Sites of Tourism',
    text: `# Sites of Tourism

Tourism, a dominant force in the global economy, brings to light the vast array of **natural wonders**, **cultural landmarks**, and modern attractions that captivate visitors worldwide. However, the ramifications of tourism extend beyond economic contributions, affecting social, cultural, and environmental realms.

## The Double-Edged Sword of Tourism

While sites like the **Grand Canyon** and **Machu Picchu** offer unique insights into the natural world and human history, the surge in tourism can lead to significant challenges:

- **Over-tourism**: This phenomenon not only poses a threat to natural environments and wildlife but can also damage historical sites and disrupt local communities with increased living costs and the overshadowing of traditional lifestyles.
- **Environmental Impact**: Popular tourist destinations may suffer from pollution and habitat destruction due to the influx of visitors.

## Sustainable Tourism as a Solution

The concept of _sustainable tourism_ emphasizes the need for responsible travel practices that support environmental conservation and respect for local communities. Key aspects include:

- Encouraging tourists to engage in eco-friendly practices.
- Supporting local economies through the ethical purchase of goods and services.
- Promoting cultural exchange that respects local traditions and heritage.

### Moving Forward

Tourist sites are not just destinations; they are a testament to our world's diversity and beauty. The future of tourism hinges on our ability to foster sustainable practices, ensuring that we preserve the very wonders we cherish. For more insights on sustainable tourism, visit [The Global Sustainable Tourism Council](https://www.gstcouncil.org/).

By embracing the principles of sustainable tourism, we can navigate the complexities of global travel, preserving the integrity of tourist sites while still enjoying the rich experiences they offer.`,
    student: {
      connect: {
        matriculationNo: 'A0201235C',
      },
    },
    courseOffering: {
      connect: {
        id: 2,
      },
    },
  },
]

export const seedSubmissions = async () => {
  console.log('Seeding submissions...')
  await Promise.all(
    submissions.map((submission) =>
      prisma.submission.create({
        data: submission,
      })
    )
  )
  console.info('Seeding submissions finished.')
}
