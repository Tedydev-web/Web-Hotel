using AutoMapper;
using Database.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using WebHotel.Commom;
using WebHotel.Helper;
using WebHotel.Repository.BaseRepository.NotificationRepository;

namespace WebHotel.Service.NotifiHubService;

public class HubService : Hub<IHubService>
{
    private readonly static ConnectionMapping<string> _connections =
        new ConnectionMapping<string>();
    private readonly MyDBContext _context;
    private readonly IMapper _mapper;
    private readonly INotificationRepository _notificationRepository;

    public string UserName { get; set; } = null!;
    public List<string> Roles { get; set; } = null!;

    public HubService(MyDBContext context, IMapper mapper, INotificationRepository notificationRepository)
    {
        _context = context;
        _mapper = mapper;
        _notificationRepository = notificationRepository;
    }

    [Authorize]
    public void GetUser()
    {
        UserName = Context.User?.Claims.FirstOrDefault(a => a.Type == ClaimTypes.Name)!.Value!;
        Roles = Context.User!.Claims.Where(a => a.Type == ClaimTypes.Role).Select(a => a.Value).ToList();
    }

    public void SendChatMessage(string whoReceive, string message)
    {

        if (Context.User is not null)
        {
            //Clients.Caller.ReceiveMessage(name, message);
            foreach (var connectionID in _connections.GetConnections(UserName))
            {
                Clients.Client(connectionID).ReceiveMessage(UserName, "Đã rõ");
            }
        }
    }

    public void SendChatMessageAuto(string message)
    {
        //Clients.Caller.ReceiveMessage("admin", "Đã nhận tin nhắn");
        Clients.Group(UserRoles.Employee).ReceiveMessage("admin", "Đã nhận tin nhắn");
    }

    public async Task GetAllNotification()
    {
        GetUser();
        var user = await _context.ApplicationUsers.SingleOrDefaultAsync(a => a.UserName == UserName);
        var result = await _notificationRepository.GetAll(user!.Id);
        await Clients.Caller.ReceiveNotification(result);
    }

    public override Task OnConnectedAsync()
    {
        GetUser();
        _connections.Add(UserName!, Context.ConnectionId);
        Roles!.ForEach(a => Groups.AddToGroupAsync(Context.ConnectionId, a));

        return base.OnConnectedAsync();
    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        GetUser();
        _connections.Remove(UserName!, Context.ConnectionId);
        return base.OnDisconnectedAsync(exception);
    }
}

