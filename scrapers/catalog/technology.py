"""Technology's degrees from end to end, for the app to choose from: every institution with computing, networks,
telecommunications or electronics courses and their students and graduates. The employers are curated in the app
(apps/web/src/data/demo/companies.ts), each with its source.

    python -m catalog.technology    # after python -m catalog.institutions

Writes catalog/technology.json and, for the app, apps/web/src/data/catalog/technology.json.
"""

from .output import write


def in_area(course: dict) -> bool:
    return course['area'] == 'technology'


def main() -> None:
    write('technology', in_area, named=[])


if __name__ == '__main__':
    main()
