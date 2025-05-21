# Import necessary modules from Django REST framework
from rest_framework import permissions

# Define a custom permission class to restrict access based on user roles
from rest_framework.permissions import IsAuthenticated

class RolePermission(IsAuthenticated):

    """
    Custom permission class to allow access only to users with specific roles.

    Usage:
        RolePermission(['admin']) - Allows access only to users with the 'admin' role.
        RolePermission(['admin', 'professor']) - Allows access to users with either 'admin' or 'professor' roles.
    """

    def __init__(self, roles):
        """
        Initialize the permission with a list of allowed roles.

        Args:
            roles (list): A list of roles that are allowed access.
        """
        self.roles = roles
        # Custom message displayed when permission is denied
        self.message = f"Leja refuzohet. Roli i nevojshëm: {', '.join(self.roles)}."

    def has_permission(self, request, view):
        """
        Check if the user has the required role to access the view.

        Args:
            request: The HTTP request object.
            view: The view being accessed.

        Returns:
            bool: True if the user is authenticated, has a user profile, and their role is in the allowed roles.
        """
        return (
            request.user.is_authenticated and  # Ensure the user is logged in
            hasattr(request.user, 'userprofile') and  # Check if the user has a 'userprofile' attribute
            request.user.userprofile.role in self.roles  # Verify the user's role is in the allowed roles
        )
