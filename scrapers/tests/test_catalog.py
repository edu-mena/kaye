"""The rules of the catalogue: one institution per name, its province and what each area takes. Run in scrapers/:
python -m unittest"""

import unittest

from catalog.humanities import in_area, justice_rows
from catalog.institutions import key, places


class Institutions(unittest.TestCase):
    def test_one_institution_under_the_yearbook_s_two_names(self):
        self.assertEqual(key('Universidade Katyavala Bwila'), key('Universidade Katyavala Buila'))
        self.assertEqual(key("Universidade Lueji A N'konde"), key('Universidade Lueji A´Nkonde'))
        self.assertEqual(key('Intituto Superior Politécnico de Benguela'), key('Instituto Superior Politécnico de Benguela'))
        self.assertNotEqual(key('Universidade Katyavala Buila'), key('Universidade Kimpa Vita'))

    def test_a_province_split_in_2024_places_nobody(self):
        text = '\n'.join([
            'Quadro 5.8 Estudantes por província',
            'Cabinda 3 226 3 717 6 943',
            'Universidade Onze de Novembro 1 075 1 265 2 340',
            'Cuando Cubango 740 389 1 129',
            'Instituto Superior Politécnico Privado de Menongue 740 389 1 129',
            'Quadro 5.9',
        ])
        found = places(text)
        self.assertEqual(found[key('Universidade Onze de Novembro')], 'Cabinda')
        self.assertNotIn(key('Instituto Superior Politécnico Privado de Menongue'), found)


class Humanities(unittest.TestCase):
    def test_takes_the_social_and_human_sciences_not_the_natural_ones(self):
        self.assertTrue(in_area({'name': 'Direito', 'area': 'legal'}))
        self.assertTrue(in_area({'name': 'Relações Internacionais', 'area': 'public'}))
        self.assertTrue(in_area({'name': 'Serviços Social', 'area': 'sciences'}))
        self.assertFalse(in_area({'name': 'Física', 'area': 'sciences'}))
        self.assertFalse(in_area({'name': 'Psicologia Clínica', 'area': 'health'}))

    def test_reads_four_careers_in_each_row_of_the_justice_officers_table(self):
        text = (
            '| CARREIRA | CATEGORIA | INDICE | VENCIMENTO-BASE | | REGISTOS | NOTARIADO | TRIBUNAL | DNAICC | '
            '| Técnica Superior | | Conservador de 1ª Classe | Notário de 1ª Classe | Secretário Judicial | '
            'Assessor de Identificação Principal | 960 | 579 055,80 | '
            '| 2º Ajudante de Conservador | 2º Ajudante do Notariado | Ajudante de Escrivão de 3º Classe | '
            'Emissor de 2ª Classe | 420 | 253 336,9 |'
        )
        rows = justice_rows(text)
        self.assertEqual([row['tribunal'] for row in rows], ['Ajudante de Escrivão de 3º Classe', 'Secretário Judicial'])
        self.assertEqual((rows[0]['registos'], rows[0]['index'], rows[0]['salary']), ('2º Ajudante de Conservador', 420, 253_337))
        self.assertEqual(rows[1]['notariado'], 'Notário de 1ª Classe')
        self.assertEqual(justice_rows('| Conservador | Notário | sem índice |'), [])


if __name__ == '__main__':
    unittest.main()
