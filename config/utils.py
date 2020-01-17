
def get_grade_options(value):
    """
    :input A+:105|A:100|A-:95|B+:80|B:75|B-:70|C+:55|C:50|C-:45|D+:30|D:25|D-:20|F:0
    :output [
        {'value': '105', 'name': 'A+'},
        {'value': '100', 'name': 'A'},
        {'value': '95', 'name': 'A-'},
        {'value': '80', 'name': 'B+'},
        {'value': '75', 'name': 'B'},
        {'value': '70', 'name': 'B-'},
        {'value': '55', 'name': 'C+'},
        {'value': '50', 'name': 'C'},
        {'value': '45', 'name': 'C-'},
        {'value': '30', 'name': 'D+'},
        {'value': '25', 'name': 'D'},
        {'value': '20', 'name': 'D-'},
        {'value': '0', 'name': 'F'}]
    """
    default_value = [
        {'value': 0, 'name': 'A+'},
        {'value': 0, 'name': 'A'},
        {'value': 0, 'name': 'A-'},
        {'value': 0, 'name': 'B+'},
        {'value': 0, 'name': 'B'},
        {'value': 0, 'name': 'B-'},
        {'value': 0, 'name': 'C+'},
        {'value': 0, 'name': 'C'},
        {'value': 0, 'name': 'C-'},
        {'value': 0, 'name': 'D+'},
        {'value': 0, 'name': 'D'},
        {'value': 0, 'name': 'D-'},
        {'value': 0, 'name': 'F'},
    ]

    def listToObj(values):
        return {'name': values[0], 'value': values[1]}

    try:
        return list(map(lambda x: listToObj(x.split(':')), value.split('|')))
    except Exception:
        return default_value
