import zxcvbn

def analyze_password(password: str):
    result = zxcvbn.zxcvbn(password)
    return {
        "score": result["score"], # 0-4
        "crack_times_display": result["crack_times_display"],
        "feedback": result["feedback"],
        "calc_time": result["calc_time"]
    }
