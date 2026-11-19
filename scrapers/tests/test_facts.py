"""The rules that turn a job post into facts. Run in scrapers/: python -m unittest"""

import unittest

from areas import course_area, sector_area
from education.anuario import _split
from jobs.classify import career, employer_sector, sector
from jobs.facts import company, kind, openings, province, salary


class Facts(unittest.TestCase):
    def test_keeps_jobs_and_drops_news_digests_and_tips(self):
        self.assertEqual(kind('Vaga para Técnico de Redes na Unitel', ['Emprego']), 'vaga')
        self.assertEqual(kind('MININT abre Concurso Público com 7.682 vagas', []), 'concurso')
        self.assertIsNone(kind('Barragem do Bero prevê criar 5.500 empregos no Namibe', ['Notícias']))
        self.assertIsNone(kind('🔥 24 Vagas de Emprego em Angola Hoje – 26/10/2026', ['Várias Vagas']))
        self.assertIsNone(kind('Confira (45) Vagas Para Técnicos de nível médio e superior Publicadas', ['Emprego']))
        self.assertIsNone(kind('Como fazer um CV de sucesso', ['Dicas úteis']))
        self.assertEqual(kind('Técnico de Recursos Humanos', ['Recursos Humanos', 'Emprego']), 'vaga')

    def test_finds_employer_place_openings_and_salary(self):
        self.assertEqual(company('TAAG Abre Recrutamento para Assistentes de Bordo 2026'), 'TAAG')
        self.assertEqual(company('Vaga para Técnico de Redes na Unitel'), 'Unitel')
        self.assertIsNone(company('Vagas de emprego no Huambo'))
        self.assertEqual(province('Engenheiro Civil – Lubango', [], ''), 'Huíla')
        self.assertEqual(openings('Governo Provincial de Luanda abre Concurso Público com 486 Vagas'), 486)
        self.assertEqual(salary('O salário base é de 250.000,00 Kz mensais'), 250_000)
        self.assertIsNone(salary('Salário competitivo'))


class Classify(unittest.TestCase):
    def test_sector_and_tech_career(self):
        self.assertEqual(sector('Desenvolvedor Full Stack'), 'technology')
        self.assertEqual(career('Desenvolvedor Full Stack', 'technology'), 'desenvolvedor-full-stack')
        self.assertEqual(sector('Gestor de Redes Sociais'), 'marketing')
        self.assertEqual(career('Gestor de Redes Sociais', 'marketing'), 'gestor-de-marketing-digital')
        self.assertIsNone(career('Sapateiro', sector('Sapateiro')))
        self.assertEqual(employer_sector('BFA tem 2 novas oportunidades'), 'finance')

    def test_job_sectors_and_courses_share_the_same_areas(self):
        self.assertEqual(sector_area('telecom'), 'technology')
        self.assertEqual(course_area('Engenharia Informática'), 'technology')
        self.assertEqual(course_area('Ensino da Matemática'), 'education')
        self.assertEqual(course_area('Medicina Veterinária'), 'agriculture')


class Yearbook(unittest.TestCase):
    def test_reads_thousands_by_making_men_and_women_add_up(self):
        self.assertEqual(_split(['987', '431', '1', '418']), [987, 431, 1418])
        self.assertEqual(_split(['901', '1', '419', '2', '320']), [901, 1419, 2320])
        self.assertEqual(_split(['-', '3', '3']), [0, 3, 3])


if __name__ == '__main__':
    unittest.main()
