using AutoMapper;
using Database.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebHotel.DTO.BlogDtos;

namespace WebHotel.Controllers.UserController;

[ApiController]
[Route("user/blog/")]
[ApiVersion("1.0")]
public class BlogUserController : ControllerBase
{
    private readonly MyDBContext _context;
    private readonly IMapper _mapper;
    public BlogUserController(MyDBContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    [HttpGet]
    [Route("get-all")]
    public async Task<IActionResult> GetAll()
    {
        var blogs = await _context.Blogs.Include(a => a.Poster).Include(a => a.Poster.UserRoles).ThenInclude(a => a.Role).AsNoTracking().OrderByDescending(a => a.Id).ToListAsync();
        if (blogs.Count == 0)
        {
            return NotFound();
        }
        var result = _mapper.Map<List<BlogResponseDto>>(blogs);
        return Ok(result);
    }

    [HttpGet]
    [Route("get-top-new")]
    public async Task<IActionResult> GetTopNew()
    {
        var blogs = await _context.Blogs.Include(a => a.Poster).Include(a => a.Poster.UserRoles).ThenInclude(a => a.Role).AsNoTracking().OrderByDescending(a => a.Id).Take(5).ToListAsync();
        if (blogs.Count == 0)
        {
            return NotFound();
        }
        var result = _mapper.Map<IEnumerable<BlogResponseDto>>(blogs);
        return Ok(result);
    }

    [HttpGet]
    [Route("get-by-id")]
    public async Task<IActionResult> GetById(int id)
    {
        var blog = await _context.Blogs.Include(a => a.Poster).Include(a => a.Poster.UserRoles).ThenInclude(a => a.Role).AsNoTracking().OrderByDescending(a => a.Id).SingleOrDefaultAsync(a => a.Id == id);
        if (blog is null)
        {
            return NotFound();
        }
        var result = _mapper.Map<BlogResponseDto>(blog);
        return Ok(result);
    }

    [HttpPost]
    [Route("get-by-search")]
    public IActionResult GetBySearch(ParameterSearchDto parameterSearch)
    {
        var blogs = _context.Blogs.Include(a => a.Poster).Include(a => a.Poster.UserRoles).ThenInclude(a => a.Role).AsNoTracking().AsEnumerable();
        if (parameterSearch.CreatedAt is not null)
        {
            blogs = blogs.Where(a => a.CreatedAt == parameterSearch.CreatedAt);
        }
        if (parameterSearch.ShortTitle?.Length > 0)
        {
            blogs = blogs.Where(a => a.ShortTitle.Contains(parameterSearch.ShortTitle));
        }
        if (parameterSearch.LongTitle?.Length > 0)
        {
            blogs = blogs.Where(a => a.LongTitle.Contains(parameterSearch.LongTitle));
        }
        if (parameterSearch.PosterEmail?.Length > 0)
        {
            blogs = blogs.Where(a => a.Poster.Email == parameterSearch.PosterEmail);
        }
        if (parameterSearch.PosterRole?.Length > 0)
        {
            blogs = blogs.Where(a => a.Poster.UserRoles.Select(a => a.Role!.Name).Contains(parameterSearch.PosterRole));
        }
        if (blogs is null)
        {
            return NotFound();
        }
        blogs = blogs.OrderByDescending(a => a.Id);
        var result = _mapper.Map<List<BlogResponseDto>>(blogs);
        return Ok(result);
    }
}
