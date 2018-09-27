package awkwardrobots;

import awkwardrobots.UI.DashboardView;
import awkwardrobots.UI.UploadView;
import com.vaadin.annotations.Theme;
import com.vaadin.annotations.VaadinServletConfiguration;
import com.vaadin.navigator.Navigator;
import com.vaadin.server.VaadinRequest;
import com.vaadin.server.VaadinServlet;
import com.vaadin.ui.Alignment;
import com.vaadin.ui.UI;
import com.vaadin.ui.VerticalLayout;

import javax.servlet.annotation.WebServlet;

/**
 * This UI is the application entry point. A UI may either represent a browser window 
 * (or tab) or some part of an HTML page where a Vaadin application is embedded.
 * <p>
 * The UI is initialized using {@link #init(VaadinRequest)}. This method is intended to be 
 * overridden to add component to the user interface and initialize non-component functionality.
 */
@Theme("mytheme")
public class Main extends UI {

    private VerticalLayout rootLayout = new VerticalLayout();
    private Navigator navigator = new Navigator(this, rootLayout);

    public Navigator getNavigator() {
        return navigator;
    }

    @Override
    protected void init(VaadinRequest vaadinRequest) {
        setContent(rootLayout);
        rootLayout.setMargin(false);
        rootLayout.setDefaultComponentAlignment(Alignment.TOP_CENTER);

        UploadView uploadView = new UploadView();
        DashboardView dashboardView = new DashboardView();

        getNavigator().addView("", uploadView);
        getNavigator().addView("Upload", uploadView);
        getNavigator().addView("Dashboard", dashboardView);
    }

    @WebServlet(urlPatterns = "/*", name = "MyUIServlet", asyncSupported = true)
    @VaadinServletConfiguration(ui = Main.class, productionMode = false)
    public static class MyUIServlet extends VaadinServlet {
    }
}
