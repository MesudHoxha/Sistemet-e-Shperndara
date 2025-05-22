class TenantFilterMixin:
    def get_tenant_queryset(self, base_queryset):
        user = self.request.user
        if not hasattr(user, 'userprofile'):
            return base_queryset.none()

        role = user.userprofile.role

        # ✅ Admin, Finance dhe ExamOfficer shohin gjithçka (universale)
        if role in ['admin', 'finance', 'exam_officer']:
            return base_queryset

        try:
            if role == 'secretary':
                faculty = Secretary.objects.get(user=user).faculty
                return base_queryset.filter(faculty=faculty)
            elif role == 'student':
                faculty = Student.objects.get(user=user).faculty
                return base_queryset.filter(faculty=faculty)
            elif role == 'professor':
                faculty = Professor.objects.get(user=user).faculty
                return base_queryset.filter(faculty=faculty)
            elif role == 'librarian':
                librarian = Librarian.objects.get(user=user)
                return base_queryset.filter(library__faculty=librarian.library.faculty)
        except Exception:
            return base_queryset.none()

        return base_queryset
