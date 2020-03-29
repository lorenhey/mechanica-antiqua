class QuipuString:
    def __init__(self, value, color="natural"):
        self.value = value
        self.color = color
        self.knots = self._parse_value_to_knots(value)

    def _parse_value_to_knots(self, value):
        knots = []
        power = 0
        while value > 0:
            digit = value % 10
            knots.append({'power': power, 'count': digit})
            value //= 10
            power += 1
        return knots[::-1] # Highest power first
