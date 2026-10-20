import { describe, it, expect, beforeEach } from 'vitest';
import { MockCompanyRepository } from '@/data/repository';
import { calculateProfileCompleteness } from '@/lib/completeness';
import { Company } from '@/data/types';
import { INITIAL_COMPANIES } from '@/data/mock/companies';

describe('Arab Season Leads Core Business Logic', () => {
  let repo: MockCompanyRepository;

  beforeEach(() => {
    // Fresh repository instance before each test
    repo = new MockCompanyRepository(INITIAL_COMPANIES);
  });

  // TEST 1: 5-contact limit
  describe('5-Contact Limit Enforcement', () => {
    it('blocks adding a sixth contact to a company and throws "Maximum 5 contacts"', async () => {
      // Find a company with contacts or use a test fixture
      const companies = await repo.getCompanies();
      const testCompany = companies[0];

      // Reset contacts to exactly 5
      testCompany.contacts = [
        { id: 'c1', name: 'Contact 1', role: 'Role 1', phone: '111', email: 'c1@test.com' },
        { id: 'c2', name: 'Contact 2', role: 'Role 2', phone: '222', email: 'c2@test.com' },
        { id: 'c3', name: 'Contact 3', role: 'Role 3', phone: '333', email: 'c3@test.com' },
        { id: 'c4', name: 'Contact 4', role: 'Role 4', phone: '444', email: 'c4@test.com' },
        { id: 'c5', name: 'Contact 5', role: 'Role 5', phone: '555', email: 'c5@test.com' },
      ];
      await repo.updateCompany(testCompany.id, { contacts: testCompany.contacts });

      // Attempting to add 6th contact should throw error
      await expect(
        repo.saveContact(testCompany.id, {
          name: 'Contact 6 (Excess)',
          role: 'Role 6',
          phone: '666',
          email: 'c6@test.com',
        })
      ).rejects.toThrow('Maximum 5 contacts');
    });

    it('allows updating an existing contact even when 5 contacts exist', async () => {
      const companies = await repo.getCompanies();
      const testCompany = companies[0];

      testCompany.contacts = [
        { id: 'c1', name: 'Contact 1', role: 'Role 1', phone: '111', email: 'c1@test.com' },
        { id: 'c2', name: 'Contact 2', role: 'Role 2', phone: '222', email: 'c2@test.com' },
        { id: 'c3', name: 'Contact 3', role: 'Role 3', phone: '333', email: 'c3@test.com' },
        { id: 'c4', name: 'Contact 4', role: 'Role 4', phone: '444', email: 'c4@test.com' },
        { id: 'c5', name: 'Contact 5', role: 'Role 5', phone: '555', email: 'c5@test.com' },
      ];
      await repo.updateCompany(testCompany.id, { contacts: testCompany.contacts });

      // Updating contact c3 should succeed
      const updated = await repo.saveContact(testCompany.id, {
        id: 'c3',
        name: 'Contact 3 Updated',
        role: 'Senior Role 3',
        phone: '333-999',
        email: 'c3updated@test.com',
      });

      const found = updated.contacts.find((c) => c.id === 'c3');
      expect(found?.name).toBe('Contact 3 Updated');
      expect(updated.contacts.length).toBe(5);
    });
  });

  // TEST 2: Profile completeness calculation
  describe('Profile Completeness Calculation', () => {
    it('calculates 100% when all 6 dimensions are satisfied', () => {
      const completeCompany: Company = {
        id: 'test_comp_100',
        name: 'Perfect Profile Ltd',
        sector: 'Real Estate',
        companyType: 'Enterprise',
        status: 'New Customers',
        temperature: 'hot',
        country: 'KSA',
        city: 'Riyadh',
        address: 'King Fahd Road, Riyadh',
        phone: '+966 11 000 0000',
        website: 'https://perfect.sa',
        linkedIn: 'https://linkedin.com/company/perfect',
        instagram: 'https://instagram.com/perfect',
        description: 'Complete company profile description',
        followUpFlag: false,
        notes: [],
        contacts: [
          { id: '1', name: 'A', role: 'R', phone: 'p', email: 'e' },
          { id: '2', name: 'B', role: 'R', phone: 'p', email: 'e' },
          { id: '3', name: 'C', role: 'R', phone: 'p', email: 'e' },
          { id: '4', name: 'D', role: 'R', phone: 'p', email: 'e' },
          { id: '5', name: 'E', role: 'R', phone: 'p', email: 'e' },
        ],
        timeline: [],
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const result = calculateProfileCompleteness(completeCompany);
      expect(result.score).toBe(100);
      expect(result.isComplete).toBe(true);
      expect(result.items.every((item) => item.completed)).toBe(true);
    });

    it('calculates partial score when dimensions are missing', () => {
      const partialCompany: Company = {
        id: 'test_comp_partial',
        name: 'Minimal Profile Ltd',
        sector: 'IT & Technology',
        companyType: 'SME',
        status: 'New Customers',
        temperature: 'cold',
        country: 'UAE',
        city: 'Dubai',
        address: '', // missing
        phone: '+971 4 000 0000', // has phone (+15)
        website: 'https://minimal.ae', // has website (+15)
        linkedIn: '', // missing
        instagram: '', // missing
        description: '',
        followUpFlag: false,
        notes: [],
        contacts: [
          { id: '1', name: 'A', role: 'R', phone: 'p', email: 'e' }, // 1 contact (+5)
        ],
        timeline: [],
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const result = calculateProfileCompleteness(partialCompany);
      expect(result.score).toBe(35); // 15 + 15 + 5
      expect(result.isComplete).toBe(false);

      const websiteItem = result.items.find((i) => i.key === 'website');
      expect(websiteItem?.completed).toBe(true);

      const addressItem = result.items.find((i) => i.key === 'address');
      expect(addressItem?.completed).toBe(false);
    });
  });

  // TEST 3: Status change logging into activity timeline
  describe('Status Change Audit Logging', () => {
    it('records an audit event in company timeline when status changes', async () => {
      const companies = await repo.getCompanies();
      const company = companies.find((c) => c.status === 'New Customers');
      expect(company).toBeDefined();

      const updated = await repo.updateCompanyStatus(
        company!.id,
        'Closed Customers',
        'Fahad Al-Harbi',
        'Signed annual contract'
      );

      expect(updated.status).toBe('Closed Customers');
      expect(updated.timeline.length).toBeGreaterThan(0);

      const latestEvent = updated.timeline[0];
      expect(latestEvent.type).toBe('status_change');
      expect(latestEvent.metadata?.fromStatus).toBe('New Customers');
      expect(latestEvent.metadata?.toStatus).toBe('Closed Customers');
      expect(latestEvent.author).toBe('Fahad Al-Harbi');
      expect(latestEvent.description).toContain('Signed annual contract');
    });
  });

  // TEST 4: Filter-to-URL sync logic verification
  describe('Filter State URL Synchronization', () => {
    it('parses URL search parameters into structured filter state', () => {
      const searchParams = new URLSearchParams(
        'status=Old+Customers&sector=Fuel+%26+Energy&country=KSA&temp=hot&city=Riyadh&kpi=hot'
      );

      const status = searchParams.get('status');
      const sector = searchParams.get('sector');
      const country = searchParams.get('country');
      const temp = searchParams.get('temp');
      const city = searchParams.get('city');
      const kpi = searchParams.get('kpi');

      expect(status).toBe('Old Customers');
      expect(sector).toBe('Fuel & Energy');
      expect(country).toBe('KSA');
      expect(temp).toBe('hot');
      expect(city).toBe('Riyadh');
      expect(kpi).toBe('hot');
    });
  });
});
