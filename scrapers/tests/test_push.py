"""What the light run sends to the API. Run in scrapers/: python -m unittest"""

import unittest

from jobs.push import BATCH, batches, facts


def row(number: int, day: str = '2026-11-20') -> dict:
    return {
        'id': f'angovagas:{number}', 'source': 'angovagas', 'date': day, 'url': f'https://angovagas.net/{number}',
        'title': 'Técnico', 'kind': 'vaga', 'company': None, 'province': 'Luanda', 'sector': 'banking', 'career': None,
        'openings': 1, 'text': 'the text of the post must never be sent', 'salary': 100,
    }


class Push(unittest.TestCase):
    def test_sends_only_the_facts_the_api_keeps(self):
        sent = facts([row(1)], None)[0]
        self.assertNotIn('text', sent)
        self.assertNotIn('salary', sent)
        self.assertEqual(set(sent), {'id', 'source', 'date', 'url', 'title', 'kind', 'company', 'province', 'sector', 'career', 'openings'})

    def test_the_light_run_sends_only_the_recent_posts(self):
        rows = [row(1, '2026-11-01'), row(2, '2026-11-20'), row(3, '2026-11-22')]
        self.assertEqual([sent['id'] for sent in facts(rows, '2026-11-20')], ['angovagas:2', 'angovagas:3'])

    def test_a_long_list_goes_in_requests_the_api_accepts(self):
        rows = facts([row(number) for number in range(BATCH * 2 + 1)], None)
        sizes = [len(batch) for batch in batches(rows)]
        self.assertEqual(sizes, [BATCH, BATCH, 1])
        self.assertEqual(list(batches([])), [])


if __name__ == '__main__':
    unittest.main()
