namespace WebHotel.Startup
{
    public static class AuthorSetup
    {
        public static IServiceCollection AuthorService(this IServiceCollection services)
        {
            services.AddAuthorization(options =>
            {
                options.AddPolicy("User", policy =>
                {
                    policy.RequireClaim("Roles", "User");
                });
            });
            return services;
        }
    }
}
