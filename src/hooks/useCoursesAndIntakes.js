import { useState, useEffect } from 'react';
import { api } from '../services/api';

export function useCoursesAndIntakes() {
  const [courses, setCourses] = useState([]);
  const [intakes, setIntakes] = useState([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.courses.getAll(), api.courses.getIntakes()])
      .then(([courseRes, intakeRes]) => {
        if (cancelled) return;
        if (courseRes.success && courseRes.data?.courses) setCourses(courseRes.data.courses);
        if (intakeRes.success && intakeRes.data?.intakes) setIntakes(intakeRes.data.intakes);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return { courses, intakes };
}
