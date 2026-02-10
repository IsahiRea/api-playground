// Faker template categories for the template picker UI
// Each category groups related faker methods for easy discovery

// Categories: Person, Internet, Location, Commerce, Company
// Each entry: { id, label, templates: [{ label, template }] }

export const FAKER_TEMPLATE_CATEGORIES = [{
    id: 'person',
    label: 'Person',
    templates: [
        { label: 'Full Name', template: '{{faker.person.fullName()}}' },
        { label: 'First Name', template: '{{faker.person.firstName()}}' },
        { label: 'Last Name', template: '{{faker.person.lastName()}}' },
        { label: 'Job Title', template: '{{faker.person.jobTitle()}}' },
    ],
}, {
    id: 'internet',
    label: 'Internet',
    templates: [
        { label: 'Email', template: '{{faker.internet.email()}}' },
        { label: 'Username', template: '{{faker.internet.userName()}}' },
        { label: 'URL', template: '{{faker.internet.url()}}' },
        { label: 'IP Address', template: '{{faker.internet.ip()}}' },
    ],
}, {
    id: 'location',
    label: 'Location',
    templates: [
        { label: 'City', template: '{{faker.location.city()}}' },
        { label: 'Country', template: '{{faker.location.country()}}' },
        { label: 'Latitude', template: '{{faker.location.latitude()}}' },
        { label: 'Longitude', template: '{{faker.location.longitude()}}' },
    ],  
}, {
    id: 'commerce',
    label: 'Commerce',
    templates: [
        { label: 'Product Name', template: '{{faker.commerce.productName()}}' },
        { label: 'Price', template: '{{faker.commerce.price()}}' },
        { label: 'Department', template: '{{faker.commerce.department()}}' },
        { label: 'Product Adjective', template: '{{faker.commerce.productAdjective()}}' },
    ],  
}, {
    id: 'company',
    label: 'Company',
    templates: [
        { label: 'Company Name', template: '{{faker.company.name()}}' },
        { label: 'Catch Phrase', template: '{{faker.company.catchPhrase()}}' },
        { label: 'Buzz Phrase', template: '{{faker.company.buzzPhrase()}}' },
        { label: 'Buzz Noun', template: '{{faker.company.buzzNoun()}}' },
    ],
}];
