"""The employers' names in the Mercado counts (jobs/summarize.py), as GET /market/week reads them too."""

import unittest

from jobs.summarize import _company_key


class CompanyKeyTest(unittest.TestCase):
    def test_spellings_of_one_employer_share_a_key(self):
        self.assertEqual(_company_key('UNITEL S.A.'), _company_key('Unitel'))
        self.assertEqual(_company_key('MINEA - RECLIMA'), _company_key('MINEA (UCP)'))
        self.assertEqual(
            _company_key('Noble Group-Industrial Sector (Future Group)'),
            _company_key('Noble Group-Sector Industrial'),
        )
        self.assertEqual(_company_key('Noble Group-Sector Industrial'), 'noble group')

    def test_a_hyphen_inside_a_one_word_name_is_part_of_it(self):
        self.assertEqual(_company_key('Coca-Cola Bottling Luanda'), 'coca cola bottling luanda')
        self.assertNotEqual(_company_key('Coca-Cola'), _company_key('Coca'))


if __name__ == '__main__':
    unittest.main()
